import React, { useState, useEffect } from "react";
import Alert from "./Alert.jsx";
import useFetch from "react-fetch-hook";

function Car(props) {

    const resultReglaments = useFetch("http://localhost/api/car/reglaments?car_id="+props.car.id, {headers: {'Authorization': props.token}});
    const resultWorks = useFetch("http://localhost/api/car/works?car_id="+props.car.id, {headers: {'Authorization': props.token}});

    if (!resultReglaments.isLoading) {
        console.log(resultReglaments.data);
    }

    if (!resultWorks.isLoading) {
        console.log(resultWorks.data);
    }

//    if (resultReglaments.isLoading) {
//        return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
//    }
//
//    if (resultReglaments.error){
//        return <div>Error while getting data. {resultReglaments.error.status}</div>;
//    }

    return (
    <div className="row ">
          <div className="col">
            <div className="container text-center">
                <div className="row row-cols-2">
                    <div className="col">
                        <p className="h1 text-start">{props.car.car_manufacturer.name} {props.car.car_model.name}, {props.car.production_year}</p>
                    </div>
                    <div className="col">
                        <p className="h1 text-end">{props.car.mileage} км</p>
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
                        <p className="h3 text-start">Предстоящие работы</p>

                        <div className="list-group">
                            <span className="list-group-item list-group-item-action" aria-current="false">
                                <div className="d-flex w-100 justify-content-between">
                                  <h5 className="mb-1">Замена масла в ДВС</h5>
                                  <span> осталось 2300 км или 2 месяца</span>
                                </div>
                                <div className="progress" role="progressbar" aria-label="Progress" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100">
                                    <div className="progress-bar" style={{width: '70%'}}></div>
                                </div>
                              </span>
                              <span className="list-group-item list-group-item-action" aria-current="false">
                                <div className="d-flex w-100 justify-content-between">
                                  <h5 className="mb-1">Продление ОСАГО</h5>
                                  <span> осталось 3 месяца</span>
                                </div>
                                <div className="progress" role="progressbar" aria-label="Progress" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                                    <div className="progress-bar" style={{width: '75%'}}></div>
                                </div>
                              </span>
                          </div>

                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col">
                        <p className="h3 text-start">Список регламентных работ</p>






                        <div className="list-group">
                            <span className="list-group-item list-group-item-action" aria-current="true">
                                <div className="d-flex w-100 justify-content-center">
                                    <strong>Добавить</strong>
                                </div>
                              </span>
                            { resultReglaments.isLoading && <span className="list-group-item list-group-item-action" aria-current="false"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></span>}
                            { resultReglaments.error && <div className="text-center">Не удалось получить данные. {resultReglaments.error.status}</div>}
                            {!resultReglaments.isLoading && resultReglaments.data.result.map((work, index) =>{
                                return (
                                <span className="list-group-item list-group-item-action" aria-current="false">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">{work.name}</h5>
                                        <span>{work.interval_mileage ? work.interval_mileage + ' км'  : ''} {work.interval_mileage && work.interval_month ? ' или': ''} {work.interval_month ? work.interval_month + ' месяц(а/ев)'   : ''}</span>
                                    </div>
                                </span>
                                );
                            })}
                          </div>

                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col">
                        <p className="h3 text-start">История работ</p>

                        <div className="list-group">
                            <span className="list-group-item list-group-item-action" aria-current="true">
                                <div className="d-flex w-100 justify-content-center">
                                    <strong>Добавить</strong>
                                </div>
                              </span>
                            { resultWorks.isLoading && <span className="list-group-item list-group-item-action" aria-current="false"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></span>}
                            {!resultWorks.isLoading && resultWorks.data.result.map((work, index) =>{
                                return (
                                <span className="list-group-item list-group-item-action" aria-current="false">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">{work.reglament_work.name}</h5>
                                        <span>{ new Date( Date.parse(work.date)).toLocaleString("ru", {year: 'numeric',month: 'long',day: 'numeric'}) } {work.mileage > 0 ? '(' + work.mileage + 'км)': ''}</span>
                                    </div>
                                </span>
                                );
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
                 <Car token={token} car={car}/>
            )
        })}


      </div>
  );
}

export default Garage;
