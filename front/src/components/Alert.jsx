import React from "react";

function Alert( props ) {
    return(
    <>
        <div className={'alert alert-danger mt-2 text-start ' + (props.source.error.show ? "" : "d-none")}  role="alert">{props.source.error.text}</div>
        <div className={'alert alert-success mt-2 text-start ' + (props.source.success.show ? "" : "d-none")}  role="alert">{props.source.success.text}</div>
    </>
    );
}

export default Alert;
