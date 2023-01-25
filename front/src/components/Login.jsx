import React, { useState } from "react";
import PropTypes from 'prop-types';
import Alert from "./Alert.jsx";



export default function Login({ setToken }) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [hideErrorbox, setHideErrorbox] = useState(true);
  const [AlertMain, setAlertMain] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
  const [AlertRegister, setAlertRegister] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

const register = async e => {
        e.preventDefault();
        const target = e.target;
        console.log(target.name)
        let email = e.target.elements.email.value;
        let first_name = e.target.elements.first_name.value;
        let last_name = e.target.elements.last_name.value;
        let birthdate = e.target.elements.birthdate.value;
        let password_new_1 = e.target.elements.password_new_1.value;
        let password_new_2 = e.target.elements.password_new_2.value;
        console.log(email, first_name, last_name, birthdate, password_new_1, password_new_2)
        let data = {"email":email, "password": password_new_1, "first_name":first_name, "last_name": last_name, "birthdate": birthdate}
        if(password_new_1 === password_new_2){
            let result = await fetch('http://localhost/api/register', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
            let json_data = await result.json()
            if(json_data){
                    if (json_data.status == 'SUCCESS') {
                        setAlertRegister({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Пользователь зарегистрирован.'}});
                        let credentials = {'email': email, 'password': password_new_1}
                        let result = await fetch('http://localhost/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(credentials)})
                        let json_data = await result.json()
                        if(json_data.status == 'SUCCESS'){
                            console.log('Token: ' + json_data.token)
                            setToken(json_data.token);

                        }
                    } else {
                         setAlertRegister({'error':{'show': true, 'text': 'Ошибка: '+json_data.description}, 'success': {'show': false, 'text': ''}});
                         console.log(result)
                    }
            } else setAlertRegister({'error':{'show': true, 'text': 'Ошибка при обращении к серверу.'}, 'success': {'show': false, 'text': ''}});
        } else {
            setAlertRegister({'error':{'show': true, 'text': 'Введённые пароли не совпадают.'}, 'success': {'show': false, 'text': ''}});
        }



    }


  const login = async e => {
    e.preventDefault();
    let credentials = {'email': email, 'password': password}
    console.log(JSON.stringify(credentials))

    let result = await fetch('http://localhost/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(credentials)})
    let json_data = await result.json()
    if(json_data.status == 'SUCCESS'){
        console.log('Token: ' + json_data.token)
        setAlertMain({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Данные для входа верны, происходит авторизация.'}});
        setToken(json_data.token);

    } else {
        setAlertMain({'error':{'show': true, 'text': 'Указаны неверные данные для входа.'}, 'success': {'show': false, 'text': ''}});
        console.log('error logging in')
    }
  }

  return (
<div className="text-center">
      <div className="container mt-5 mb-3">
          <div className="col-lg-6 col-md-8 mx-auto">
            <h1 className="fw-light">CarLogger</h1>
            <p className="lead text-muted">Минималистичная система для планирования технического обслуживания транспорта и учёта трат.</p>
          </div>
      </div>
      <div className="form-signin w-100 mt-5 m-auto">
        <form onSubmit={login}>
          <div className="form-floating">
            <input type="email" className="form-control" id="InputEmail" onChange={e => setEmail(e.target.value)}/>
            <label htmlFor="InputEmail">Email</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="InputPassword" onChange={e => setPassword(e.target.value)}/>
            <label htmlFor="InputPassword">Пароль</label>
          </div>
          <button type="submit" className="btn btn-primary">Войти</button>
          <button className="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRegister" aria-expanded="false" aria-controls="collapseExample">Зарегистрироваться</button>
          <Alert source={AlertMain} />
        </form>
      </div>
      <div className="collapse" id="collapseRegister">
          <div className="container text-end mt-3 mb-3 form-signup">
            <div className="row justify-content-md-center">
              <div className="col-sm text-end">
                <form onSubmit={register}>
                   <div className="form-floating mb-3">
                      <input type="email"  name="email" id="email_field" className="form-control"/>
                      <label htmlFor="email_field" >E-mail</label>
                   </div>
                   <div className="form-floating mb-3">
                      <input type="text" name="first_name" id="first_name_field" className="form-control"  />
                      <label htmlFor="first_name_field" >Имя</label>
                   </div>
                   <div className="form-floating mb-3">
                      <input type="text" name="last_name" id="last_name_field" className="form-control"   />
                      <label htmlFor="last_name_field" >Фамилия</label>
                   </div>
                   <div className="form-floating mb-3">
                      <input type="date" name="birthdate" className="form-control" id="birthdate"/>
                      <label htmlFor="birthdate">Дата рождения</label>
                   </div>
                   <div className="form-floating mb-3">
                      <input type="password" name="password_new_1" id="password1" className="form-control"  />
                      <label htmlFor="password1" >Введите пароль</label>
                   </div>
                   <div className="form-floating mb-3">
                      <input type="password" name="password_new_2" id="password2" className="form-control"  />
                      <label htmlFor="password2" >Повторите пароль</label>
                   </div>
                   <div className="form-floating mb-3 text-center">
                       <button type="submit" className="btn btn-primary">Зарегистрироваться</button>
                       <Alert source={AlertRegister} />
                   </div>
                </form>
              </div>
            </div>
          </div>
      </div>

    </div>
  );
}

//Login.propTypes = {
//  setToken: PropTypes.func.isRequired
//}