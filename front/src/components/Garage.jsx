import React, { useState, useEffect } from "react";
import Alert from "./Alert.jsx";
import useFetch from "react-fetch-hook";
import createTrigger from "react-use-trigger";
import useTrigger from "react-use-trigger/useTrigger";

const requestTrigger = createTrigger();

function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}

function Reglament(props) {
    const requestTriggerValue = useTrigger(requestTrigger);
    const [AlertUpdateReglament, setAlertUpdateReglament] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertAddReglamentLog, setAlertAddReglamentLog] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

    const updateReglament = async e => {
        e.preventDefault();
        var reglament_id = e.target.elements.reglament_id.value;
        var name = e.target.elements.reglament_name.value;
        var interval_months = e.target.elements.reglament_interval_months.value;
        var interval_mileage = e.target.elements.reglament_interval_mileage.value;
        var description = e.target.elements.reglament_description.value;
        console.log(reglament_id, name, interval_months, interval_mileage, description);

        let result = await fetch("http://localhost/api/car/reglaments?id="+reglament_id+"&mileage="+interval_mileage+"&months="+interval_months+"&name="+name+"&description="+description, { method: 'POST', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdateReglament({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Регламент изменён.'}});
            await timeout(1000);
            requestTrigger()
            setAlertUpdateReglament({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertUpdateReglament({'error':{'show': true, 'text': 'Произошла ошибка при добавлении регламента. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }

    const deleteReglament = async (id) => {

        console.log(id);

        let result = await fetch("http://localhost/api/car/reglaments?id="+id, { method: 'DELETE', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdateReglament({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Регламент удалён.'}});
            await timeout(1000);
            requestTrigger()
            setAlertUpdateReglament({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertUpdateReglament({'error':{'show': true, 'text': 'Произошла ошибка при удалении регламента. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }

    const addReglamentLog = async e => {
        e.preventDefault();
        var reglament_id = e.target.elements.reglament_id.value;
        var car_id = e.target.elements.car_id.value;
        var mileage = e.target.elements.mileage.value;
        var date = e.target.elements.date.value;
        var comment = e.target.elements.comment.value;
        console.log(reglament_id, car_id, mileage,date,comment);

        let result = await fetch("http://localhost/api/car/works?car_id="+car_id+"&work_id="+reglament_id+"&mileage="+mileage+"&date="+date+"&comment="+comment, { method: 'PUT', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertAddReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Работа добавлена.'}});
            e.target.reset()
            await timeout(1000);
            requestTrigger()
            let collapse = document.getElementById("collapseWorkLog"+reglament_id);
            collapse.classList.toggle('show')
            setAlertAddReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertAddReglamentLog({'error':{'show': true, 'text': 'Произошла ошибка при добавлении работы. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }

    return (
        <span className="list-group-item list-group-item-action" aria-current="false" key={props.work.id}>
            <div className="d-flex w-100 justify-content-between">
                <div className="d-flex w-100 justify-content-between mb-1">
                    <div className="col">
                        <h5 className="mb-1 text-start">
                            {props.work.name}
                        </h5>
                    </div>
                    <div className="col text-end p-0">
                        <div className="btn-group btn-group-sm " role="group" aria-label="Basic mixed styles example">
                            <button type="button" className="btn btn-outline-dark" data-bs-toggle="collapse" data-bs-target={"#collapseWorkLog"+props.work.id}>Внести в историю</button>
                            <button type="button" className="btn btn-outline-dark"  data-bs-toggle="collapse" data-bs-target={"#collapseWork"+props.work.id}>Изменить</button>
                        </div>
                    </div>
                </div>
                <span>
                    {props.work.interval_mileage ? props.work.interval_mileage + ' км'  : ''} {props.work.interval_mileage && props.work.interval_months ? ' или': ''} {props.work.interval_months ? props.work.interval_months + ' месяц(а/ев)'   : ''}
                </span>
            </div>

            <div className="progress" role="progressbar" aria-label="Progress" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                <div className={"progress-bar "+ (props.work.expiration_percent >= 100 ? "bg-danger" : (props.work.expiration_percent > 80 ? "bg-warning" : "bg-success"))} style={{width: props.work.expiration_percent+"%"}}>
                    {props.work.expiration_percent}%
                </div>
            </div>

            <div className="collapse" id={"collapseWork"+props.work.id}>
                <div className="w-100 justify-content-between mt-3">
                    <form onSubmit={updateReglament}>
                        <input type="text" className="visually-hidden" name="reglament_id" defaultValue={props.work.id} />
                        <div className="mb-3">
                            <input className="form-control" name="reglament_name"  id="DataList" placeholder="Название работы"  defaultValue={props.work.name} />
                        </div>
                        <div className="input-group mb-3">
                            <input type="number" step="1" name="reglament_interval_months" className="form-control" defaultValue={props.work.interval.months} />
                            <span className="input-group-text" id="basic-addon2">Интервал в месяцах</span>
                        </div>
                        <div className="input-group mb-3">
                                    <input type="number" step="1" name="reglament_interval_mileage" className="form-control" defaultValue={props.work.interval.mileage} />
                                    <span className="input-group-text" id="basic-addon2">Интервал в километрах</span>
                        </div>
                        <div className="mb-3">
                                    <input className="form-control" name="reglament_description" placeholder="Описание"  defaultValue={props.work.description} />
                        </div>
                        <div className="d-flex w-100 justify-content-between">
                            <button type="button" className="btn btn-danger"  onClick={e => deleteReglament(props.work.id)}>Удалить</button>
                            <button type="submit" className="btn btn-success" >Сохранить</button>
                        </div>
                        <Alert source={AlertUpdateReglament} />
                    </form>
                </div>
            </div>

            <div className="collapse" id={"collapseWorkLog"+props.work.id}>
                <div className="w-100 justify-content-between mt-3">
                    <form onSubmit={addReglamentLog}>
                        <input type="text" className="visually-hidden" name="reglament_id"  defaultValue={props.work.id} />
                        <input type="text" className="visually-hidden" name="car_id"  defaultValue={props.car.id} />
                        <div className="form-floating mb-3">
                            <input type="date" name="date" className="form-control" id={"DateReglamentLog"+props.work.id} defaultValue={new Date().toISOString().slice(0, 10)}/>
                            <label htmlFor={"DateReglamentLog"+props.work.id}>Дата проведения работ</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="number" step="1" name="mileage" className="form-control" id={"MileageReglamentLog"+props.work.id} defaultValue={props.car.mileage} />
                            <label htmlFor={"MileageReglamentLog"+props.work.id}>Пробег (км) на момент проведения работ</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control" name="comment"  id={"CommentReglamentLog"+props.work.id} placeholder="Комментарий к работе"  defaultValue="" />
                            <label htmlFor={"CommentReglamentLog"+props.work.id}>Комментарий к работе</label>
                        </div>
                        <div className="d-flex w-100 justify-content-between">
                            <button type="submit" className="btn btn-success" >Добавить</button>
                        </div>
                        <Alert source={AlertAddReglamentLog} />
                    </form>
                </div>
            </div>

        </span>
);

}

function ReglamentLog(props) {
    const requestTriggerValue = useTrigger(requestTrigger);
    const [AlertUpdateReglamentLog, setAlertUpdateReglamentLog] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

    const updateReglamentLog = async e => {
        e.preventDefault();
        var work_id = e.target.elements.work_id.value;
        var mileage = e.target.elements.mileage.value;
        var date = e.target.elements.date.value;
        var comment = e.target.elements.comment.value;
        console.log(work_id, mileage, date, comment);

        let result = await fetch("http://localhost/api/car/works?work_id="+work_id+"&mileage="+mileage+"&date="+date+"&comment="+comment, { method: 'POST', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdateReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Регламент изменён.'}});
            await timeout(1000);
            requestTrigger()
            setAlertUpdateReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertUpdateReglamentLog({'error':{'show': true, 'text': 'Произошла ошибка при изменении регламента. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }

    const deleteReglamentLog = async (id) => {

        console.log(id);

        let result = await fetch("http://localhost/api/car/works?id="+id, { method: 'DELETE', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdateReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Работа удалена.'}});
            await timeout(1000);
            requestTrigger()
            setAlertUpdateReglamentLog({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertUpdateReglamentLog({'error':{'show': true, 'text': 'Произошла ошибка при удалении работы. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }

    return (
        <span className="list-group-item list-group-item-action" aria-current="false" key={props.work.id}>
            <div className="d-flex w-100 justify-content-between"  data-bs-toggle="collapse" data-bs-target={"#collapseWorkLogHistory"+props.work.id}>
                <h5 className="mb-1">{props.work.reglament_work.name}</h5>
                <span>{ new Date( Date.parse(props.work.date)).toLocaleString("ru", {year: 'numeric',month: 'long',day: 'numeric'}) } {props.work.mileage > 0 ? '(' + props.work.mileage + 'км)': ''}</span>
            </div>
            { props.work.comment && <p className="m-0 text-start"><small>{props.work.comment}</small></p>}
            <div className="collapse" id={"collapseWorkLogHistory"+props.work.id}>
                <div className="w-100 justify-content-between mt-3">
                    <form onSubmit={updateReglamentLog}>
                        <input type="text" className="visually-hidden" name="work_id"  defaultValue={props.work.id} />
                        <div className="form-floating mb-3">
                            <input type="date" name="date" className="form-control" id={"DateReglamentLog"+props.work.id} defaultValue={props.work.date}/>
                            <label htmlFor={"DateReglamentLog"+props.work.id}>Дата проведения работ</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="number" step="1" name="mileage" className="form-control" id={"MileageReglamentLog"+props.work.id} defaultValue={props.work.mileage} />
                            <label htmlFor={"MileageReglamentLog"+props.work.id}>Пробег (км) на момент проведения работ</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control" name="comment"  id={"CommentReglamentLog"+props.work.id} placeholder="Комментарий к работе"  defaultValue="" />
                            <label htmlFor={"CommentReglamentLog"+props.work.id}>Комментарий к работе</label>
                        </div>
                        <div className="d-flex w-100 justify-content-between">
                            <button type="button" className="btn btn-danger"  onClick={e => deleteReglamentLog(props.work.id)}>Удалить</button>
                            <button type="submit" className="btn btn-success" >Сохранить</button>
                        </div>
                        <Alert source={AlertUpdateReglamentLog} />
                    </form>
                </div>
            </div>
        </span>
);

}

function Car(props) {

    const requestTriggerValue = useTrigger(requestTrigger);
    const [AlertAddReglament, setAlertAddReglament] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [showIssuing, setShowIssuing] = useState(true);



    const resultReglaments = useFetch("http://localhost/api/car/reglaments?car_id="+props.car.id+"&only_issuing="+(showIssuing ? "True" : "False"), {headers: {'Authorization': props.token}, depends: [requestTriggerValue]});
    const resultWorks = useFetch("http://localhost/api/car/works?car_id="+props.car.id, {headers: {'Authorization': props.token}, depends: [requestTriggerValue]});






    if (!resultReglaments.isLoading) {
        console.log(resultReglaments.data);
    }

    if (!resultWorks.isLoading) {
        console.log(resultWorks.data);
    }

    const addReglament = async e => {
        e.preventDefault();
        var car_id = e.target.elements.car_id.value;
        var name = e.target.elements.name.value;
        var interval_months = e.target.elements.interval_months.value;
        var interval_mileage = e.target.elements.interval_mileage.value;
        var description = e.target.elements.description.value;
        console.log(car_id, name, interval_months,interval_mileage,description);

        let result = await fetch("http://localhost/api/car/reglaments?car_id="+car_id+"&mileage="+interval_mileage+"&months="+interval_months+"&name="+name+"&description="+description, { method: 'PUT', headers: {'Authorization': props.token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertAddReglament({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Регламент добавлен.'}});
            e.target.reset()
            await timeout(1000);
            requestTrigger()
            let collapse = document.getElementById("collapseNewReglament_car"+car_id);
            collapse.classList.toggle('show')
            setAlertAddReglament({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

        } else {
            setAlertAddReglament({'error':{'show': true, 'text': 'Произошла ошибка при добавлении регламента. '+json_data.description}, 'success': {'show': false, 'text': ''}});
        }
    }


    useEffect(() => {
    }, [showIssuing]);

    return (
    <div className="row mt-5">
          <div className="col">
            <div className="container text-center">
                <div className="row row-cols-2">
                    <div className="col">
                        <p className="h1 text-start">{props.car.car_manufacturer.name} {props.car.car_model.name}, {props.car.production_year}</p>
                    </div>
                    <div className="col">
                        <p className="h1 text-end">{new Intl.NumberFormat("ru").format(props.car.mileage)} км</p>
                    </div>
                </div>
                <div className="row row-cols-2">
                    <div className="col">
                        <p className="lead text-start">{props.car.car_modification.name}</p>
                    </div>
                    <div className="col text-end">
                        <button type="button" className="btn btn-link">Редактировать</button>
                    </div>
                </div>
                <div className="row row-cols-3">
                    <div className="col">
                        <p className="h6 text-start">Госномер: {props.car.license_plate}</p>
                    </div>
                    <div className="col">
                        <p className="h6 text-start">VIN: {props.car.vin}</p>
                    </div>
                    <div className="col">
                    </div>
                </div>


                <div className="row mt-3">
                    <div className="col">
                        <div className="row row-cols-2">
                            <div className="col">
                                <p className="h3 text-start">Список регламентных работ</p>
                            </div>
                            <div className="col">
                                <div className="form-check form-switch form-check-reverse pt-2">
                                    <input className="form-check-input" type="checkbox" id="flexSwitchCheckReverse" defaultChecked={true} onClick={e => setShowIssuing(e.target.checked)}/>
                                    <label className="form-check-label" htmlFor="flexSwitchCheckReverse">Только истекающие</label>
                                </div>
                            </div>
                        </div>
                        <div className="list-group">
                            <span className="list-group-item list-group-item-action">
                                <div className="d-flex w-100 justify-content-center" data-bs-toggle="collapse" data-bs-target={"#collapseNewReglament_car"+props.car.id}>
                                    <strong>Добавить</strong>
                                </div>
                            </span>

                            <div className="collapse" id={"collapseNewReglament_car"+props.car.id}>
                                <div className="card card-body mt-2 mb-2">
                                    <div className="d-flex w-100 justify-content-between">
                                        <p className="fs-5 mb-1 text-start">Для добавления регламента необходимо указать как минимум один из интервалов. Если указаны оба, то расчёт будет производиться исходя из того, который истечёт раньше.</p>
                                    </div>
                                    <form onSubmit={addReglament}>
                                        <input type="text" className="visually-hidden" name="car_id" defaultValue={props.car.id} />
                                        <div className="mb-3">
                                                    <input className="form-control" name="name"  id="DataList" placeholder="Название работы"  defaultValue={''} />
                                        </div>
                                        <div className="input-group mb-3">
                                            <input type="number" step="1" name="interval_months" className="form-control" defaultValue={0} />
                                            <span className="input-group-text" id="basic-addon2">Интервал в месяцах</span>
                                        </div>
                                        <div className="input-group mb-3">
                                                    <input type="number" step="1" name="interval_mileage" className="form-control" defaultValue={0} />
                                                    <span className="input-group-text" id="basic-addon2">Интервал в километрах</span>
                                        </div>
                                        <div className="mb-3">
                                                    <input className="form-control" name="description" placeholder="Описание"  defaultValue={''} />
                                        </div>
                                        <div className="d-flex w-100 justify-content-between">
                                                    <button type="submit" className="btn btn-success" >Добавить</button>
                                        </div>
                                        <Alert source={AlertAddReglament} />
                                    </form>
                                </div>
                            </div>
                            { resultReglaments.isLoading && <span className="list-group-item list-group-item-action" aria-current="false"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></span>}
                            { resultReglaments.error && <div className="text-center">Не удалось получить данные. {resultReglaments.error.status}</div>}

                            {!resultReglaments.isLoading && resultReglaments.data.result.map((work, index) =>{
                                return(
                                     <Reglament token={props.token} work={work} car={props.car} key={work.id}/>
                                )
                            })}
                        </div>

                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col">
                        <p className="h3 text-start">История работ</p>

                        <div className="list-group">
                            { resultWorks.isLoading && <span className="list-group-item" aria-current="false"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></span>}
                            { !resultWorks.isLoading && resultWorks.data.result.length == 0 && <span className="list-group-item" aria-current="false">Пусто</span>}
                            {!resultWorks.isLoading && resultWorks.data.result.map((work, index) =>{
                                return(
                                     <ReglamentLog token={props.token} work={work} key={work.id}/>
                                )
                            })}

                          </div>

                    </div>
                </div>

              </div>


            </div>

        </div>
);


}


function Garage({ token }) {
const result = useFetch("http://localhost/api/user/car", {headers: {'Authorization': token}});

if (!result.isLoading) {
    console.log(result.data);
  }

  if (result.isLoading) {
        return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  if (result.error){
        return <div><p className="h3 text-center">Ошибка при загрузке.</p><p className="h6 text-center">{result.error.status} - {result.error.statusText}</p></div>;
  }

  return (
      <div className="container text-center">
       {result.data.result.map((car, index) =>{
            return(
                 <Car token={token} car={car} key={car.id}/>
            )
        })}


      </div>
  );
}

export default Garage;
