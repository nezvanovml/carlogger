import React, { useState, useEffect } from "react";

import Alert from "./Alert.jsx";

const subtractMonths = (date, months) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - months);
      return result;
    };


function Transactions({ token }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactionsNumber, setTransactionsNumber] = useState(0);
    const [categoriesNumber, setCategoriesNumber] = useState(0);

    const [autoFill, setAutoFill] = useState([]);

    const [startDate, setStartDate] = useState((subtractMonths(new Date(), 1)).toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [searchCategory, setSearchCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState({});
    const [selectedTransaction, setSelectedTransaction] = useState({});

    const [AlertMain, setAlertMain] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertUpdate, setAlertUpdate] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});
    const [AlertAdd, setAlertAdd] = useState({'error':{'show': false, 'text': ''}, 'success': {'show': false, 'text': ''}});

    const loadData = (start, end, category) =>{
        fetch('/api/transactions?start_date='+start+'&end_date='+end+'&category='+category, {headers: {'Authorization': token}})
             .then((response) => response.json())
             .then((data) => {
                console.log(data);
                var dict = autoFill;
                data.transactions.map((transaction) => {
                            if(dict.indexOf(transaction.comment) === -1 ) dict.push(transaction.comment)
                });
                setAutoFill(dict)
                console.log(autoFill);

                setTransactions(data.transactions);
                setTransactionsNumber(data.count)


             })
             .catch((err) => {
                console.log(err.message);
             });

        fetch('/api/categories',{headers: {'Authorization': token}})
             .then((response) => response.json())
             .then((data) => {
                console.log(data);
                var dict = {};
                data.categories.map((category) => {
                    dict[category.id] = category.name
                });
                setCategories(data.categories);
                setCategoriesNumber(data.count)
             })
             .catch((err) => {
                console.log(err.message);
             });

//         var dict = autoFill;
//         transactions.map((transaction) => {
//                     if(dict.indexOf(transaction.comment) === -1 ) dict.push(transaction.comment)
//         });
//         setAutoFill(dict)
//         console.log(autoFill);
    };

    const updateTransaction = async e => {
        e.preventDefault();
        console.log(e.target.elements.date.value,e.target.elements.sum.value,e.target.elements.category.value,e.target.elements.comment.value,e.target.elements.id.value)
        let date = e.target.elements.date.value;
        let sum = e.target.elements.sum.value;
        let category = e.target.elements.category.value;
        let comment = e.target.elements.comment.value;
        let id = e.target.elements.id.value;
        //if (!(categories.find(o => o.id == category).income)) sum = sum * (-1);
        let result = await fetch('/api/transactions?category='+category+'&date='+date+'&sum='+sum+'&comment='+comment+'&transaction='+id, { method: 'POST', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdate({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Данные сохранены.'}});
            loadData(startDate, endDate, searchCategory);
        } else {
            setAlertUpdate({'error':{'show': true, 'text': 'Произошла ошибка при обновлении.'}, 'success': {'show': false, 'text': ''}});
        }

    }

    const addTransaction = async e => {
        e.preventDefault();
        console.log(e.target.elements.date.value,e.target.elements.sum.value,e.target.elements.category.value,e.target.elements.comment.value)
        let date = e.target.elements.date.value;
        let sum = e.target.elements.sum.value;
        let category = e.target.elements.category.value;
        let comment = e.target.elements.comment.value;
        //if (!(categories.find(o => o.id == category).income)) sum = sum * (-1);
        let result = await fetch('/api/transactions?category='+category+'&date='+date+'&sum='+sum+'&comment='+comment, { method: 'PUT', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertAdd({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Транзакция добавлена.'}});
            loadData(startDate, endDate, searchCategory);
            e.target.reset()
        } else {
            setAlertAdd({'error':{'show': true, 'text': 'Произошла ошибка при добавлении.'}, 'success': {'show': false, 'text': ''}});
        }
    }

    const deleteTransaction = async (id) => {
        console.log('Delete: '+id)
        let result = await fetch('/api/transactions?transaction='+id, { method: 'DELETE', headers: {'Authorization': token}})
        let json_data = await result.json()
        if (json_data.status == 'SUCCESS') {
            setAlertUpdate({'error':{'show': false, 'text': ''}, 'success': {'show': true, 'text': 'Транзакция удалена.'}});
            loadData(startDate, endDate, searchCategory);
        } else {
            setAlertUpdate({'error':{'show': true, 'text': 'Произошла ошибка при удалении.'}, 'success': {'show': false, 'text': ''}});
        }
    }

    useEffect(() => {
        loadData(startDate, endDate, searchCategory);
    }, [startDate, endDate, searchCategory, autoFill]);

  return (
        <div className="container text-end mt-3 mb-3">
              <div className="row justify-content-md-center ">
                    <div className="col-lg text-end">
                          <h1>Транзакции</h1>
                          <form className=" ">
                                <select className="form-select form-select-lg mb-3" onChange={e => setSearchCategory(e.target.value)}>
                                      <option selected>Все категории</option>
                                      {categories.map((category) => {
                                            return (
                                                <option value={category.id} key={category.id}>{category.name}</option>
                                            );
                                      })}
                                </select>

                                <div className="form-floating mb-3">
                                        <input type="date" className="form-control" id="InputStart" defaultValue={startDate} onChange={e => setStartDate(e.target.value)}/>
                                        <label htmlFor="InputStart">Начало</label>
                                </div>
                                <div className="form-floating mb-3">
                                        <input type="date" className="form-control" id="InputEnd" defaultValue={endDate} onChange={e => setEndDate(e.target.value)}/>
                                        <label htmlFor="InputEnd">Конец</label>
                                </div>
                          </form>
                          <div className="row m-3">
                                <div className="col text-right fs-5">Найдено транзакций: </div>
                                <div className="col text-left col-2 fs-5">{transactionsNumber}</div>
                          </div>
                          <Alert source={AlertMain} />
                    </div>
                    <div className="col-lg">
                          <ul className="list-group m-2 justify-content-between mb-5">
                                <li className={'list-group-item list-group-item-action text-dark bg-opacity-50 '}>
                                        <div data-bs-toggle="collapse" data-bs-target={"#collapseNew"} >
                                                <div className="d-flex w-100 justify-content-center">
                                                        <strong>Добавить транзакцию</strong>
                                                </div>

                                        </div>
                                        <div className="collapse" id={"collapseNew"}>
                                                <div className="card card-body mt-2">
                                                        <form onSubmit={addTransaction}>
                                                                <div className="mb-3">
                                                                        <select name="category" className="form-select form-select-lg mb-3">
                                                                        {categories.map((category) => {
                                                                                return (
                                                                                    <option value={category.id} key={category.id} selected={category.id == searchCategory ? "selected" : false} >{category.name}</option>
                                                                                );
                                                                         })}

                                                                        </select>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="date" name="date" className="form-control" id="InputEnd" defaultValue={new Date().toISOString().slice(0, 10)}/>
                                                                        <label htmlFor="InputEnd">Дата</label>
                                                                </div>
                                                                <div className="input-group mb-3">
                                                                        <input type="number" step="0.01" name="sum" className="form-control" placeholder="Сумма" aria-describedby="basic-addon2" />
                                                                        <span className="input-group-text" id="basic-addon2">₽</span>
                                                                </div>
                                                                <div className="mb-3">
                                                                        <input className="form-control" name="comment"  list="datalistOptions" id="DataList" placeholder="Комментарий" />
                                                                        <datalist id="datalistOptions">
                                                                          {autoFill.map(function(item) {
                                                                            return (
                                                                                <option value={item} />
                                                                            );
                                                                            })}

                                                                          { autoFill.forEach(function(item, index){ return (<option value={item} />)}) }
                                                                        </datalist>
{/*                                                                         <input type="text" name="comment" className="form-control" placeholder="Комментарий" id="exampleInputPassword1"/> */}
                                                                </div>
                                                                <div className="d-flex w-100 justify-content-center">
                                                                    <button type="submit" className="btn btn-primary btn-lg w-100" >Добавить</button>
                                                                </div>
                                                                <Alert source={AlertAdd} />
                                                        </form>
                                                </div>
                                        </div>
                                </li>
                                {transactions.map((transaction) => {
                                    return (
                                <li key={transaction.id} className={'list-group-item list-group-item-action text-dark bg-opacity-50 ' + (transaction.category_income ? "bg-success" : "bg-danger")}  aria-current="true">
                                        <div data-bs-toggle="collapse" data-bs-target={"#collapseExample"+transaction.id} >
                                                <div className="d-flex w-100 justify-content-between">
                                                        <p className="fs-6 mb-1">{transaction.category_name}</p>
                                                        <p className="fs-6 mb-1">{ new Date( Date.parse(transaction.date)).toLocaleString("ru", {year: 'numeric',month: 'long',day: 'numeric'}) }</p>
                                                </div>
                                                <div className="d-flex w-100 justify-content-between">
                                                        <p className="fs-6 text-start mb-1">{transaction.comment}</p><p className="fs-6 fw-bold mb-1"> {(transaction.sum > 0 ? transaction.sum : transaction.sum * (-1)).toLocaleString('ru', {style: 'currency', currency: 'RUB'})}</p>
                                                </div>
                                        </div>
                                        <div className="collapse" id={"collapseExample"+transaction.id}>
                                                <div className="card card-body">
                                                        <form onSubmit={updateTransaction}>
                                                                <input type="text" className="visually-hidden" name="id" defaultValue={transaction.id} />
                                                                <div className="mb-3">
                                                                        <select name="category" className="form-select form-select-lg mb-3" id={"category"+transaction.id}>
                                                                        {categories.map((category) => {
                                                                                return (
                                                                                    <option value={category.id} key={category.id} selected={category.id == transaction.category_id ? "selected" : false} >{category.name}</option>
                                                                                );
                                                                         })}
                                                                        </select>
                                                                </div>
                                                                <div className="form-floating mb-3">
                                                                        <input type="date" name="date" className="form-control" id="InputEnd" defaultValue={transaction.date}/>
                                                                        <label htmlFor="InputEnd">Дата</label>
                                                                </div>
                                                                <div className="input-group mb-3">
                                                                        <input type="number" step="0.01" name="sum" className="form-control" placeholder="Сумма" defaultValue={transaction.sum > 0 ? transaction.sum : transaction.sum * (-1)} aria-describedby="basic-addon2" />
                                                                        <span className="input-group-text" id="basic-addon2">₽</span>
                                                                </div>
                                                                <div className="mb-3">
                                                                        <input className="form-control" name="comment"  list="datalistOptions" id="DataList" placeholder="Комментарий"  defaultValue={transaction.comment} />
{/*                                                                         <input type="text" name="comment" className="form-control" placeholder="Комментарий" id="exampleInputPassword1" defaultValue={transaction.comment}/> */}
                                                                </div>
                                                                <div className="d-flex w-100 justify-content-between">
                                                                        <button type="button" className="btn btn-danger" onClick={e => deleteTransaction(transaction.id)}>Удалить</button>
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

export default Transactions;
