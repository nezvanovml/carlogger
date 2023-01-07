import React, { useState, useEffect } from "react";
import Alert from "./Alert.jsx";


function Categories({ token }) {
    const [categories, setCategories] = useState([]);
    const [categoriesNumber, setCategoriesNumber] = useState(0);

    const [AlertMain, setAlertMain] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertUpdate, setAlertUpdate] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertAdd, setAlertAdd] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

    const loadData = () =>{
        fetch('/api/categories',{headers: {'Authorization': token}})
             .then((response) => response.json())
             .then((data) => {
                console.log(data);
                setCategories(data.categories);
                setCategoriesNumber(data.count)
             })
             .catch((err) => {
                console.log(err.message);
             });
    };

    const joinCategory = async (from, to) => {
        let result = await fetch('/api/categories/join?category_from='+from+'&category_to='+to, { method: 'POST', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdate({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Слияние категорий прошло успешно.'}});
            loadData();
        } else {
            setAlertUpdate({'error':{'show': true, 'text': 'Произошла ошибка при слиянии.'}, 'success': {'show': false, 'text': ''}});
        }
    }

    const updateCategory = async e => {
        e.preventDefault();
        let id = e.target.elements.id.value;
        let name = e.target.elements.name.value;
        let type = e.target.elements.type.value;
        let join = e.target.elements.category_join.value;
        let description = e.target.elements.description.value;
        if (type == 'income') type = 'True'
        else type = 'False'
        console.log(id, name, description, type, join)

        let result = await fetch('/api/categories?name='+name+'&description='+description+'&category='+id+'&income='+type, { method: 'POST', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdate({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Данные сохранены.'}});
            loadData();
        } else {
            setAlertUpdate({'error':{'show': true, 'text': 'Произошла ошибка при обновлении.'}, 'success': {'show': false, 'text': ''}});
        }
        if(join) joinCategory(id, join);
    }

    const addCategory = async e => {
        e.preventDefault();
        let name = e.target.elements.name.value;
        let type = e.target.elements.type.value;
        let description = e.target.elements.description.value;

        console.log(name, type, description)

        if (type == 'income') type = 'True'
        else type = 'False'

        let result = await fetch('/api/categories?name='+name+'&income='+type+'&description='+description, { method: 'PUT', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertAdd({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Категория добавлена.'}});
            loadData();
            e.target.reset()
        } else {
            setAlertAdd({'error':{'show': true, 'text': 'Произошла ошибка при добавлении.'}, 'success': {'show': false, 'text': ''}});
        }
    }

    const deleteCategory = async (id) => {
        console.log('Delete: '+id)
        let result = await fetch('/api/categories?category='+id, { method: 'DELETE', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdate({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Категория удалена.'}});
            loadData();
        } else {
            setAlertUpdate({'error':{'show': true, 'text': 'Произошла ошибка при удалении.'}, 'success': {'show': false, 'text': ''}});
        }
    }

    useEffect(() => {
        loadData();
    }, []);

  return (
        <div className="container text-end mt-3 mb-3">
              <div className="row justify-content-md-center">
                    <div className="col-lg text-end">
                          <h1>Категории</h1>

                          <div className="row m-3">
                                <div className="col text-right fs-5">Найдено категорий: </div>
                                <div className="col text-left col-2 fs-5">{categoriesNumber}</div>
                          </div>
                          <Alert source={AlertMain} />
                    </div>
                    <div className="col-lg">
                          <ul className="list-group m-2 justify-content-between mb-5">
                                <li className={'list-group-item list-group-item-action text-dark bg-opacity-50 '}>
                                        <div data-bs-toggle="collapse" data-bs-target={"#collapseNew"} >
                                                <div className="d-flex w-100 justify-content-center fs-5">
                                                        <strong>Добавить категорию</strong>
                                                </div>

                                        </div>
                                        <div className="collapse" id={"collapseNew"}>
                                                <div className="card card-body mt-2">
                                                        <form onSubmit={addCategory}>
                                                                <div className="mb-3">
                                                                        <input type="text" name="name" className="form-control" placeholder="Название" defaultValue="" aria-describedby="basic-addon2" />
                                                                </div>
                                                                <div className="mb-3">
                                                                        <input type="text" name="description" className="form-control" placeholder="Описание"/>
                                                                </div>
                                                                <div className="d-flex w-100 justify-content-around mb-3">
                                                                        <input type="radio" className="btn-check " value="income" name="type" id="success-outlined" autoComplete="off"  />
                                                                        <label className="btn btn-outline-success " htmlFor="success-outlined">Доход</label>
                                                                        <input type="radio" className="btn-check" value="spent" name="type" id="danger-outlined" autoComplete="off" defaultChecked={true} />
                                                                        <label className="btn btn-outline-danger " htmlFor="danger-outlined">Расход</label>
                                                                </div>
                                                                <div className="d-flex w-100 justify-content-center">
                                                                    <button type="submit" className="btn btn-primary btn-lg w-100" >Добавить</button>
                                                                </div>
                                                                <Alert source={AlertAdd} />
                                                        </form>
                                                </div>
                                        </div>
                                </li>
                                {categories.map((category) => {
                                    return (
                                <li key={category.id} className={'list-group-item list-group-item-action text-dark bg-opacity-50 ' + (category.income ? "bg-success" : "bg-danger")}  aria-current="true">
                                        <div data-bs-toggle="collapse" data-bs-target={"#collapseExample"+category.id} >
                                                <div className="d-flex w-100 justify-content-between fs-6">
                                                        {category.name}
                                                </div>
                                        </div>
                                        <div className="collapse" id={"collapseExample"+category.id}>
                                                <div className="card card-body">
                                                        <form onSubmit={updateCategory}>
                                                                <input type="text" className="visually-hidden" name="id" defaultValue={category.id} />
                                                                <div className="mb-3">
                                                                        <input type="text" name="name" className="form-control" placeholder="Название" defaultValue={category.name} aria-describedby="basic-addon2" />
                                                                </div>
                                                                <div className="mb-3">
                                                                        <input type="text" name="description" className="form-control" placeholder="Описание" defaultValue={category.description}/>
                                                                </div>
                                                                <select name="type" className="form-select form-select-lg mb-3">
                                                                        <option value="income" key="income" selected={category.income ? "selected" : false} >Доход</option>
                                                                        <option value="spent" key="spent" selected={!category.income ? "selected" : false} >Расход</option>
                                                                </select>
                                                                <select name="category_join" className="form-select form-select-lg mb-3">
                                                                        <option value="" selected>Объединить с ...</option>
                                                                        {
                                                                        categories.map((current) => {
                                                                                    if(category.id != current.id){
                                                                                        return (
                                                                                                <option value={current.id} key={current.id}>{current.name}</option>
                                                                                        );
                                                                                    }
                                                                        })
                                                                        }
                                                                        </select>
                                                                <div className="d-flex w-100 justify-content-between">
                                                                        <button type="button" className="btn btn-danger" onClick={e => deleteCategory(category.id)}>Удалить</button>
                                                                        <button type="submit" className="btn btn-success" >Сохранить</button>
                                                                </div>
                                                                <Alert source={AlertUpdate} />
                                                        </form>
                                                </div>
                                        </div>
                                </li>
                                    );
                                })}
                          </ul>
                    </div>
              </div>
        </div>
  );
}

export default Categories;
