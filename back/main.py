import datetime

from app import app, config, mail, db, User, Role, userxrole, CarPersonal, ReglamentWork, reglamentxcar, CarManufacturer, CarModel, CarModification, ReglamentWorkLog, MileageLog
from flask import request, render_template, redirect, Response, url_for, flash
from functools import wraps

import hashlib
import random
import json
import re
from flask_mail import Message
from utils import check_password_was_not_used_earlier, check_list1_is_in_list2
from sqlalchemy.sql import select, update, insert, delete

from flask_cors import cross_origin

import time
import datetime
from dateutil.relativedelta import relativedelta


def add_user(email, password, first_name, last_name, birthdate, active=True):
    user = User.query.filter(User.email == email).first()
    if not user:
        user = User(email=email, password=hashlib.sha256(password.encode('utf-8')).hexdigest(),
                    first_name=first_name, last_name=last_name, active=active, birthdate=birthdate)
        try:
            db.session.add(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return False
        else:
            return user.id
    return user.id


def add_role(name, humanreadablename=""):
    role = Role.query.filter(Role.name == name).first()
    if not role:
        role = Role(name=name, humanreadablename=humanreadablename)
        try:
            db.session.add(role)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return False
        else:
            return role.id
    return role.id


def add_role_for_user(user_id, role_id):
    user = User.query.filter(User.id == user_id).first()
    role = Role.query.filter(Role.id == role_id).first()
    if user and role:
        conn = db.engine.connect()
        result = conn.execute(
            select(userxrole).where(userxrole.c.user == user.id,
                                    userxrole.c.role == role.id))
        if not result.fetchone():
            conn.execute(userxrole.insert().values(user=user.id, role=role.id))
            return True
        else:
            return False
    else:
        return False


def remove_role_for_user(user_id, role_id):
    user = User.query.filter(User.id == user_id).first()
    role = Role.query.filter(Role.id == role_id).first()
    if user and role:
        conn = db.engine.connect()
        result = conn.execute(
            select(userxrole).where(userxrole.c.user == user.id,
                                    userxrole.c.role == role.id))
        if result.fetchone():
            conn.execute(
                delete(userxrole).where(userxrole.c.user == user.id,
                                        userxrole.c.role == role.id))
            return True
        else:
            return False
    else:
        return False


def have_roles(needed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization', None)
            if token:
                actual_roles = []
                roles = Role.query \
                    .join(userxrole, userxrole.columns.role == Role.id) \
                    .join(User, User.id == userxrole.columns.employee) \
                    .filter(User.token == token, User.active == 't') \
                    .all()
                for role in roles:
                    actual_roles.append(role.name)
                if check_list1_is_in_list2(needed_roles, actual_roles):
                    return fn(*args, **kwargs)
                else:
                    return Response(json.dumps(
                        {'status': 'UNAUTHORIZED', 'description': f"You have no permissions to perform request."}),
                                    mimetype="application/json",
                                    status=401)
            return Response(json.dumps(
                {'status': 'UNAUTHORIZED', 'description': f"You must authenticate first to perform request."}),
                            mimetype="application/json",
                            status=401)

        return decorated_function

    return wrapper


def get_current_user():
    token = request.headers.get('Authorization', None)
    if token:
        user = User.query.filter(User.token == token).first()
        if user:
            return user.id
    return None


def is_authorized():
    def wrapper(fn):
        @wraps(fn)
        def decorated_function(*args, **kwargs):
            if get_current_user():
                return fn(*args, **kwargs)
            return Response(json.dumps({'status': 'UNAUTHORIZED', 'description': f"You must authenticate first to perform request."}),
                            mimetype="application/json",
                            status=401)

        return decorated_function

    return wrapper

@app.after_request
def per_request_callbacks(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

# Create a user to test with
@app.route("/api/init", methods=['GET'])
def initialization():
    admin_role = add_role("SUPERUSER", "SUPERUSER ROLE")
    user_role = add_role("USER", "Standard user")
    user = add_user(email='admin@localhost', password="admin", first_name='SUPER', last_name='ADMIN',
                    birthdate=datetime.datetime.utcnow())
    if admin_role and user:
        add_role_for_user(user, admin_role)
    if user_role and user:
        add_role_for_user(user, user_role)
    return Response("OK.", mimetype="text/html",
                    status=200)

@app.route('/api/register', methods=['PUT'])
@cross_origin()
def register():
    if not request.is_json:
        return Response(json.dumps({'status': 'ERROR', 'description': 'Provide correct JSON structure.'}),
                        mimetype="application/json", status=400)
    data = request.get_json()
    if data:
        email = data.get('email', None)
        if not email:
            return Response(json.dumps({'status': 'ERROR', 'description': f"email not provided."}),
                            mimetype="application/json",
                            status=400)
        if email:
            if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
                return Response(json.dumps({'status': 'ERROR', 'description': f"Incorrect format of email."}),
                                mimetype="application/json",
                                status=400)
            user = User.query.filter(User.email == email).first()
            if user:
                return Response(json.dumps({'status': 'ERROR', 'description': f"User with this email already registered."}),
                                mimetype="application/json",
                                status=400)

        password = data.get('password', None)
        if not password:
            return Response(json.dumps({'status': 'ERROR', 'description': f"password not provided."}),
                            mimetype="application/json",
                            status=400)

        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$'  # от 8 символов в разном регистре с цифрами
        if re.match(pattern, password) is None:
            return Response(json.dumps({'status': 'ERROR', 'description': f"Password not matches security policy."}),
                                mimetype="application/json",
                                status=400)

        first_name = data.get('first_name', None)
        if not first_name:
            return Response(json.dumps({'status': 'ERROR', 'description': f"first_name not provided."}),
                            mimetype="application/json",
                            status=400)
        last_name = data.get('last_name', None)
        if not last_name:
            return Response(json.dumps({'status': 'ERROR', 'description': f"last_name not provided."}),
                            mimetype="application/json",
                            status=400)

        birthdate = data.get('birthdate', None)

        try:
            birthdate = datetime.datetime.strptime(birthdate, '%Y-%m-%d').date()
        except ValueError:
            return Response(json.dumps(
                    {'status': 'ERROR', 'description': f"Incorrect format of birthdate. Must be YYYY-MM-DD."}),
                    mimetype="application/json",
                    status=400)
        except TypeError:
            return Response(json.dumps({'status': 'ERROR', 'description': f"birthdate not provided."}),
                                mimetype="application/json",
                                status=400)

        user = add_user(email=email, password=password, first_name=first_name, last_name=last_name,
                        birthdate=birthdate)
        user_role = add_role("USER")
        result = False
        if user_role and user:
            result = add_role_for_user(user, user_role)

        if result:
            return Response(json.dumps({'status': 'SUCCESS', 'description': 'CREATED'}),
                            mimetype="application/json",
                            status=201)
        else:
            return Response(json.dumps({'status': 'ERROR', 'description': f"Undefined error adding user."}),
                            mimetype="application/json",
                            status=500)
    else:
        return Response(json.dumps({'status': 'ERROR', 'description': 'check provided data format.'}),
                        mimetype="application/json", status=400)


@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    if not request.is_json:
        return Response(json.dumps({'status': 'ERROR', 'description': 'Provide correct JSON structure.'}),
                        mimetype="application/json", status=400)
    data = request.get_json()
    if data:
        email = data.get('email')
        password = data.get('password', " ")
        if len(password) > 0:
            user = User.query.filter(User.password == hashlib.sha256(password.encode('utf-8')).hexdigest(),
                                     User.email == email).first()
            if user:
                if not user.token or len(user.token) != 64:
                    user.token = hashlib.sha256(str(random.getrandbits(256)).encode('utf-8')).hexdigest()
                    db.session.commit()
                return Response(json.dumps({'status': 'SUCCESS', 'token': user.token}), mimetype="application/json",
                                status=200)
    return Response(json.dumps({'status': 'ERROR', 'description': 'check provided credentials.'}),
                    mimetype="application/json", status=404)


@app.route('/api/destroy_token', methods=['POST'])
@cross_origin()
@is_authorized()
def destroy_token():
    token = request.headers.get('Authorization', None)
    if token:
        user = User.query.filter(User.token == token).first()
        if user:
            user.token = None
            db.session.commit()
            return Response(json.dumps({'status': 'SUCCESS', 'description': 'token destroyed.'}),
                            mimetype="application/json", status=200)
    return Response(json.dumps({'status': 'ERROR', 'description': 'check provided credentials.'}),
                    mimetype="application/json", status=404)


@app.route('/api/change_password', methods=['POST'])
@cross_origin()
@is_authorized()
def change_password():

    if not request.is_json:
        return Response(json.dumps({'status': 'ERROR', 'description': 'Provide correct JSON structure.'}),
                        mimetype="application/json", status=400)
    data = request.get_json()
    if data:
        old_password = data.get('old_password', None)
        new_password = data.get('new_password', None)
        user_id = get_current_user()

        if not old_password or not new_password:
            return Response(json.dumps({'status': 'ERROR', 'description': f"Passwords not provided."}),
                            mimetype="application/json",
                            status=400)
        user = User.query.filter(User.id == user_id, User.password == hashlib.sha256(old_password.encode('utf-8')).hexdigest()).first()
        if user and len(new_password) > 0 and len(old_password) > 0:
            pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$'  # от 8 символов в разном регистре с цифрами
            hashed_password = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
            if re.match(pattern, new_password) is None:
                return Response(json.dumps({'status': 'ERROR', 'description': f"Password not matches security policy."}),
                                mimetype="application/json",
                                status=400)
            elif check_password_was_not_used_earlier(hashed_password, user.password_previous):
                return Response(json.dumps({'status': 'ERROR', 'description': f"Password was used earlier."}),
                                mimetype="application/json",
                                status=400)
            user.password = hashed_password
            if not user.password_previous:
                user.password_previous = hashed_password
            else:
                user.password_previous = f"{user.password_previous};{hashed_password}"
            try:
                db.session.commit()
            except Exception as error:
                db.session.rollback()
                return Response(json.dumps({'status': 'ERROR', 'description': error}),
                                mimetype="application/json",
                                status=500)
            else:
                return Response(json.dumps({'status': 'SUCCESS', 'description': 'Password changed.'}),
                                mimetype="application/json", status=201)
        return Response(json.dumps({'status': 'ERROR', 'description': f"Old password not matches."}),
                        mimetype="application/json",
                        status=400)
    return Response(json.dumps({'status': 'ERROR', 'description': 'check provided data format.'}),
                    mimetype="application/json", status=400)


@app.route('/api/checkauth', methods=['GET'])
@cross_origin()
@is_authorized()
def checkauth():
    return Response(json.dumps({'status': 'SUCCESS', 'description': 'Token is correct.'}),
                            mimetype="application/json", status=200)

@app.route('/api/user/car', methods=['GET'])
@cross_origin()
@is_authorized()
def user_car():
    if request.method == 'GET':
        user_id = get_current_user()

        cars = CarPersonal.query.filter(CarPersonal.user_id == user_id).join(CarModification, CarPersonal.car_modification_id == CarModification.id) \
            .join(CarModel, CarModification.car_model_id == CarModel.id) \
            .join(CarManufacturer, CarModel.car_manufacturer_id == CarManufacturer.id) \
            .all()
        result = {'status': 'SUCCESS', 'result': []}
        for car in cars:
            mileage = MileageLog.query.filter(MileageLog.personal_car_id == car.id).order_by(MileageLog.date.desc()).first()
            mileage_counter = mileage.mileage if mileage else 0
            mileage_date = mileage.date.strftime("%Y-%m-%d") if mileage else datetime.datetime.utcnow().strftime("%Y-%m-%d")

            car_modification_id = car.car_modification_id
            car_modification = CarModification.query.filter(CarModification.id == car_modification_id).first()
            car_modification_name = car_modification.name

            car_model_id = car_modification.car_model_id
            car_model = CarModel.query.filter(CarModel.id == car_model_id).first()
            car_model_name = car_model.name

            car_manufacturer_id = car_model.car_manufacturer_id
            car_manufacturer = CarManufacturer.query.filter(CarManufacturer.id == car_manufacturer_id).first()
            car_manufacturer_name = car_manufacturer.name

            result['result'].append({
                'id': car.id,
                'user_id': car.user_id,
                'car_manufacturer': {
                    'id': car_manufacturer_id,
                    'name': car_manufacturer_name
                },
                'car_model': {
                    'id': car_model_id,
                    'name': car_model_name
                },
                'car_modification': {
                    'id': car_modification_id,
                    'name': car_modification_name
                },
                'comment': car.comment,
                'vin': car.vin,
                'license_plate': car.license_plate,
                'production_year': car.production_year,
                'mileage_date': mileage_date,
                'mileage': mileage_counter
            })
        time.sleep(1)
        return Response(json.dumps(result), mimetype="application/json", status=200)

@app.route('/api/car/manufacturers', methods=['GET'])
@cross_origin()
@is_authorized()
def car_manufacturers():
    if request.method == 'GET':

        manufacturers = CarManufacturer.query.all()
        result = {'status': 'SUCCESS', 'result': []}
        for manufacturer in manufacturers:
            result['data'].append({
                'id': manufacturer.id,
                'name': manufacturer.name,
                'description': manufacturer.description
            })
        return Response(json.dumps(result), mimetype="application/json", status=200)

@app.route('/api/car/models', methods=['GET'])
@cross_origin()
@is_authorized()
def car_models():
    if request.method == 'GET':

        manufacturer_id = request.args.get('manufacturer_id', None)
        if manufacturer_id:
            try:
                manufacturer_id = int(manufacturer_id)
            except ValueError:
                manufacturer_id = None
            except TypeError:
                return Response(json.dumps({'status': 'ERROR', 'description': f"Incorrect format of manufacturer_id."}),
                                mimetype="application/json",
                                status=400)

        if manufacturer_id:
            manufacturer = CarManufacturer.query.filter(CarManufacturer.id == manufacturer_id).first()
            if not manufacturer:
                return Response(json.dumps({'status': 'ERROR', 'description': f"manufacturer_id does not exist."}),
                                mimetype="application/json",
                                status=404)

        models = CarModel.query
        if manufacturer_id:
            models = models.filter(CarModel.car_manufacturer_id == manufacturer_id)
        models = models.all()
        result = {'status': 'SUCCESS', 'data': []}
        for model in models:
            result['data'].append({
                'id': model.id,
                'car_manufacturer_id': model.car_manufacturer_id,
                'name': model.name,
                'description': model.description
            })
        return Response(json.dumps(result), mimetype="application/json", status=200)

@app.route('/api/car/modifications', methods=['GET'])
@cross_origin()
@is_authorized()
def car_modifications():
    if request.method == 'GET':
        model_id = request.args.get('model_id', None)
        if model_id:
            try:
                model_id = int(model_id)
            except ValueError:
                model_id = None
            except TypeError:
                return Response(json.dumps({'status': 'ERROR', 'description': f"Incorrect format of model_id."}),
                                mimetype="application/json",
                                status=400)

        if model_id:
            model = CarModel.query.filter(CarModel.id == model_id).first()
            if not model:
                return Response(json.dumps({'status': 'ERROR', 'description': f"model_id does not exist."}),
                                mimetype="application/json",
                                status=404)

        modifications = CarModification.query
        if model_id:
            modifications = modifications.filter(CarModification.car_model_id == model_id)
        modifications = modifications.all()
        result = {'status': 'SUCCESS', 'result': []}
        for modification in modifications:
            result['result'].append({
                'id': modification.id,
                'car_model_id': modification.car_model_id,
                'name': modification.name,
                'description': modification.description
            })
        return Response(json.dumps(result), mimetype="application/json", status=200)

@app.route('/api/car/reglaments', methods=['GET'])
@cross_origin()
@is_authorized()
def car_reglaments():
    if request.method == 'GET':
        user_id = get_current_user()

        car_id = request.args.get('car_id', None)
        if not car_id:
            return Response(json.dumps({'status': 'ERROR', 'description': f"car_id not provided."}),
                            mimetype="application/json",
                            status=400)
        try:
            car_id = int(car_id)
        except ValueError:
            car_id = None
        except TypeError:
            return Response(json.dumps({'status': 'ERROR', 'description': f"Incorrect format of car_id."}),
                                mimetype="application/json",
                                status=400)


        car = CarPersonal.query.filter(CarPersonal.id == car_id).first()
        if not car:
            return Response(json.dumps({'status': 'ERROR', 'description': f"car_id does not exist."}),
                                mimetype="application/json",
                                status=404)

        if not car.user_id == user_id:
            return Response(json.dumps({'status': 'ERROR', 'description': f"You have not access to car with provided car_id."}),
                            mimetype="application/json",
                            status=401)

        mileage = MileageLog.query.filter(MileageLog.personal_car_id == car_id).order_by(MileageLog.date.desc()).first()
        current_mileage = mileage.mileage if mileage else None


        works = ReglamentWork.query.filter(CarPersonal.user_id == user_id, CarPersonal.id == car_id)\
            .join(reglamentxcar, reglamentxcar.columns.reglament_work_id == ReglamentWork.id)\
            .join(CarPersonal, CarPersonal.id == reglamentxcar.columns.car_personal_id)

        works = works.all()
        result = {'status': 'SUCCESS', 'result': []}
        for work in works:
            current_work = {
                'id': work.id,
                'name': work.name,
                'description': work.description,
                'interval_mileage': work.interval_mileage,
                'interval_month': work.interval_month,
                'previous': None,
                'next': None
            }

            previous_reglament = ReglamentWorkLog.query.filter(ReglamentWorkLog.personal_car_id == car_id, ReglamentWorkLog.reglament_work_id == work.id)\
                .order_by(ReglamentWorkLog.date.desc(), ReglamentWorkLog.mileage.desc()).first()
            previous_reglament_date = previous_reglament.date.strftime("%Y-%m-%d") if previous_reglament else None
            previous_reglament_mileage = previous_reglament.mileage if previous_reglament else None

            if previous_reglament:
                current_work['previous'] = {'mileage': previous_reglament_mileage, 'date': previous_reglament_date}

            if work.interval_mileage > 0 or work.interval_month > 0:
                next_reglament = {}
                next_reglament['expired'] = False

                last_reglament_issued_mileage_percent = 0
                if work.interval_mileage > 0 and current_mileage and previous_reglament_mileage:
                    temp_mileage = work.interval_mileage - (current_mileage - previous_reglament_mileage)
                    if temp_mileage <= 0:
                        next_reglament['expired'] = True
                        next_reglament['mileage'] = 0
                        last_reglament_issued_mileage_percent = 100
                    else:
                        next_reglament['mileage'] = temp_mileage
                        last_reglament_issued_mileage_percent = int((current_mileage - previous_reglament_mileage) / work.interval_mileage * 100)

                previous_reglament_issued_month_percent = 0
                if work.interval_month > 0 and previous_reglament and previous_reglament.date:
                    end_date = previous_reglament.date + relativedelta(months=work.interval_month)
                    next_reglament['date'] = end_date.strftime("%Y-%m-%d")
                    current_date = datetime.datetime.utcnow()
                    total_days = (end_date - previous_reglament.date).days
                    if current_date >= end_date:
                        last_reglament_remain_month = 0
                        last_reglament_issued_month_percent = 100
                    else:
                        last_reglament_remain_month = int((end_date - current_date).days / 30)
                        last_reglament_issued_month_percent = int(
                            ((current_date - previous_reglament.date).days) / total_days * 100)
                    next_reglament['months'] = last_reglament_remain_month

                if (last_reglament_issued_mileage_percent or last_reglament_issued_month_percent):
                    next_reglament['percent'] = last_reglament_issued_mileage_percent if last_reglament_issued_mileage_percent > last_reglament_issued_month_percent else last_reglament_issued_month_percent

                current_work['next'] = next_reglament
            result['result'].append(current_work)
        time.sleep(1)
        return Response(json.dumps(result), mimetype="application/json", status=200)

@app.route('/api/car/works', methods=['GET'])
@cross_origin()
@is_authorized()
def car_works():
    if request.method == 'GET':
        user_id = get_current_user()

        car_id = request.args.get('car_id', None)
        if not car_id:
            return Response(json.dumps({'status': 'ERROR', 'description': f"car_id not provided."}),
                            mimetype="application/json",
                            status=400)
        try:
            car_id = int(car_id)
        except ValueError:
            car_id = None
        except TypeError:
            return Response(json.dumps({'status': 'ERROR', 'description': f"Incorrect format of car_id."}),
                                mimetype="application/json",
                                status=400)


        car = CarPersonal.query.filter(CarPersonal.id == car_id).first()
        if not car:
            return Response(json.dumps({'status': 'ERROR', 'description': f"car_id does not exist."}),
                                mimetype="application/json",
                                status=404)

        if not car.user_id == user_id:
            return Response(json.dumps({'status': 'ERROR', 'description': f"You have not access to car with provided car_id."}),
                            mimetype="application/json",
                            status=401)
        works = ReglamentWorkLog.query.filter(ReglamentWorkLog.personal_car_id == car_id)


        works = works.all()
        result = {'status': 'SUCCESS', 'result': []}
        for work in works:
            reglament = ReglamentWork.query.filter(ReglamentWork.id == work.reglament_work_id).first()
            reglament_name = reglament.name if reglament else ''
            print(work)
            result['result'].append({
                'id': work.id,
                'reglament_work': {
                    'id': work.reglament_work_id,
                    'name': reglament_name
                },
                'mileage': work.mileage,
                'date': work.date.strftime("%Y-%m-%d"),
                'comment': work.comment
            })
        time.sleep(1)
        return Response(json.dumps(result), mimetype="application/json", status=200)


if __name__ == "__main__":
    app.run(debug=False)
