import React, { useState, useEffect } from "react";
import axios from 'axios';
import Alert from "./Alert.jsx";

function Fileupload( { token } ) {
    const [AlertUpload, setAlertUpload] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const onFileUpload = async e => {
      e.preventDefault();
      setAlertUpload({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}})
        console.log(token)
      const formData = new FormData();
      formData.append(
        "file",
        e.target.files[0],
        e.target.files[0].name
      );
      console.log(e.target.files[0]);
      if(e.target.files[0] != null) {
            let result = await axios.post("api/import/csv", formData, {headers: {'Authorization': token}});

            if (result.data.status == 'SUCCESS') {
                    setAlertUpload({'error':{'show': false, 'text': '.'}, 'success': {'show': true, 'text': 'Добавлено транзакций: '+result.data.transactions}});
            } else {
                     setAlertUpload({'error':{'show': true, 'text': 'Не удалось обработать файл. '+result.data.description}, 'success': {'show': false, 'text': ''}});
                     console.log(result)
            }

      }
    };

      return (
        <div className="">
                <label htmlFor="formFile" className="form-label">Выберите CSV-файл для импорта</label>
                <input className="form-control" type="file" id="formFile" onChange={onFileUpload} />
                <Alert source={AlertUpload} />
        </div>
      );

}

function Settings({ token }) {
    const [userData, setUserData] = useState({});
    const [AlertPersonal, setAlertPersonal] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertPassword, setAlertPassword] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertMain, setAlertMain] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertTruncate, setAlertTruncate] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

    const exportData = () => {
		fetch('/api/export/csv', { method: 'GET', headers: {'Authorization': token}})
			.then(response => {
				response.blob().then(blob => {
					let url = window.URL.createObjectURL(blob);
					let a = document.createElement('a');
					a.href = url;
					a.download = 'export.csv';
					a.click();
				});
		});
	}

    const logout = () => {
        console.log('loging out')
        localStorage.removeItem('token');
        window.location.href = '/';
        return {}
    };

    const fullLogout = async e => {
        console.log('loging out with token destroying.')
        let result = await fetch('/api/destroy_token', { method: 'POST', headers: {'Authorization': token}})
        if (result.status == 200) {
            localStorage.removeItem('token');
            window.location.href = '/';
        } else {
            console.log('Could not destroy token.')
        }
        return {}
    };

    const updateData = async e => {
        let data = userData
        const target = e.target;
        console.log(target.name)
        if(target.name != 'email'){
            let result = await fetch('/api/user?'+target.name+'='+target.value, { method: 'POST', headers: {'Authorization': token}})
            if (result.status == 201){
                setAlertPersonal({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Изменения сохранены.'}});
                loadData();
            }
            else {
                setAlertPersonal({'error':{'show': true, 'text': 'Не удалось сохранить изменения.'}, 'success': {'show': false, 'text': ''}});
                console.log(result)
            }
        }
    }

    const updatePassword = async e => {
        e.preventDefault();
        setAlertPassword({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
        let current_password = e.target.elements.password_current.value
        let new_password = e.target.elements.password_new_1.value
        let new_password_repeat = e.target.elements.password_new_2.value
        if(current_password.length > 0 && new_password.length > 0 && new_password === new_password_repeat){
        let data = {'old_password': current_password, 'new_password': new_password}
        console.log(data)
            let result = await fetch('/api/change_password', { method: 'POST', headers: {'Authorization': token, 'Content-Type': 'application/json'}, body: JSON.stringify(data)}).catch(console.error)
            console.log(await result.json())
            if (result.status == 201) {
                setAlertPassword({'error':{'show': false, 'text': '.'}, 'success': {'show': true, 'text': 'Пароль изменён.'}});
                loadData();
            } else {
                 setAlertPassword({'error':{'show': true, 'text': 'Не удалось изменить пароль. Убедитесь, что пароль содержит не менее 8 символов в разном регистре, а также содержит хотя бы одну цифру.'}, 'success': {'show': false, 'text': ''}});
                 console.log(result)
            }
        } else {
            setAlertPassword({'error':{'show': true, 'text': 'Не указан текущий пароль или не совпадают новые пароли.'}, 'success': {'show': false, 'text': ''}});
        }



    }

    const truncateData = async e => {
        e.preventDefault();
        setAlertTruncate({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
        let current_password = e.target.elements.password_truncate.value
        if(current_password.length > 0){
        let data = {'password': current_password}
        console.log(data)
            let result = await fetch('/api/clear_all', { method: 'DELETE', headers: {'Authorization': token, 'Content-Type': 'application/json'}, body: JSON.stringify(data)}).catch(console.error)
            console.log(await result.json())
            let json_data = await result.json()
            if(json_data){
                if (json_data.status == 'SUCCESS') {
                    setAlertTruncate({'error':{'show': false, 'text': '.'}, 'success': {'show': true, 'text': 'Данные удалены.'}});
                    loadData();
                } else {
                     setAlertTruncate({'error':{'show': true, 'text': 'Не удалось удалить данные. Убедитесь, что указан верный пароль.'}, 'success': {'show': false, 'text': ''}});
                     console.log(result)
                }
            } else setAlertTruncate({'error':{'show': true, 'text': 'Ошибка при обращении к серверу.'}, 'success': {'show': false, 'text': ''}});
        } else {
            setAlertTruncate({'error':{'show': true, 'text': 'Не указан текущий пароль.'}, 'success': {'show': false, 'text': ''}});
        }



    }

    const loadData = () =>{
        fetch('/api/user',{headers: {'Authorization': token}})
             .then((response) => response.json())
             .then((data) => {
                console.log(data);
                setUserData(data);
             })
             .catch((err) => {
                console.log(err.message);
             });
    };

    useEffect(() => {
        loadData();
    }, []);


  return (
<div className="container text-end mt-3 mb-3">
              <Alert source={AlertMain} />
              <div className="row justify-content-md-center">
                    <div className="col-lg text-end">
                          <h1>Настройки</h1>

                          <div className="row m-3">
                                <div className="col text-right fs-5">Для изменения персональных данных внесите правки в поля, изменения сохранятся автоматически. </div>

                          </div>
                          <div className="row m-3">
                                <Fileupload token={token}/>
                          </div>
                          <div className="row ">
                                <div className="col d-flex w-100 justify-content-around">
                                        <button type="button" className="btn btn-primary m-2 w-100" onClick={exportData}>Экспорт в CSV</button>
                                </div>
                                <div className="col d-flex w-100 justify-content-around">
                                        <button type="button" className="btn btn-danger m-2 " onClick={fullLogout}>Выйти на всех устройствах</button>
                                        <button type="button" className="btn btn-warning m-2" onClick={logout}>Выйти на этом устройстве</button>
                                </div>
                          </div>
                          <div className="row ">
                          <form onSubmit={truncateData}>
                                <div className="col d-flex w-100 justify-content-around align-items-center">
                                        <div className="form-floating ">
                                                        <input type="password" name="password_truncate" id="passwordtruncate" className="form-control"   />
                                                        <label htmlFor="passwordtruncate" >Введите текущий пароль</label>
                                        </div>
                                        <div className="form-floating pt-3">
                                                        <button type="submit" className="btn btn-danger mb-3 btn-lg">Очистить</button>

                                        </div>


                                </div>
                                <Alert source={AlertTruncate} />
                                </form>
                          </div>


                    </div>

                    <div className="col-lg">

                                                <div className="mt-2">
                                                        <h1>Личные данные</h1>
                                                        <form>
                                                                <div className="form-floating mb-3">
                                                                        <input type="text" readonly name="email" id="email_field" className="form-control-plaintext" placeholder="E-mail" onChange={updateData} value={userData.email}   />
                                                                        <label htmlFor="email_field" >E-mail</label>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="text" name="first_name" id="first_name_field" className="form-control" placeholder="Имя" onChange={updateData} defaultValue={userData.first_name}  />
                                                                        <label htmlFor="first_name_field" >Имя</label>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="text" name="last_name" id="last_name_field" className="form-control" placeholder="Имя" onChange={updateData} defaultValue={userData.last_name}  />
                                                                        <label htmlFor="last_name_field" >Фамилия</label>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="date" name="birthdate" className="form-control" id="birthdate" onChange={updateData} defaultValue={userData.birthdate}/>
                                                                        <label htmlFor="birthdate">Дата рождения</label>
                                                                </div>
                                                                <div className="d-flex w-100 justify-content-around mb-3 align-items-center">
                                                                        <p className="fs-5 pt-3">Пол</p>
                                                                        <input type="radio" className="btn-check" value="male" name="gender" id="male-outlined"  onChange={updateData} checked={userData.gender === 'male'} />
                                                                        <label className="btn btn-outline-success" htmlFor="male-outlined">Мужчина</label>
                                                                        <input type="radio" className="btn-check" value="female" name="gender" id="female-outlined" onChange={updateData} checked={userData.gender === 'female' } />
                                                                        <label className="btn btn-outline-success" htmlFor="female-outlined">Женщина</label>
                                                                </div>
                                                                <Alert source={AlertPersonal} />
                                                        </form>
                                                </div>
                                                <div className=" mt-2 mb-5">
                                                <h1>Пароль</h1>
                                                        <form onSubmit={updatePassword}>
                                                                <div className="form-floating mb-3">
                                                                        <input type="password" name="password_current" id="password0" className="form-control"   />
                                                                        <label htmlFor="password0" >Введите текущий пароль</label>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="password" name="password_new_1" id="password1" className="form-control"  />
                                                                        <label htmlFor="password1" >Введите новый пароль</label>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="password" name="password_new_2" id="password2" className="form-control"  />
                                                                        <label htmlFor="password2" >Повторите новый пароль</label>
                                                                </div>
                                                                <Alert source={AlertPassword} />
                                                                <div className="d-flex w-100 justify-content-center">
                                                                        <button type="submit" className="btn btn-primary" >Сменить пароль</button>
                                                                </div>

                                                        </form>
                                                </div>


                    </div>
              </div>
        </div>
  );
}

export default Settings;
