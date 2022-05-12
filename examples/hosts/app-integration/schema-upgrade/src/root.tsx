import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app";

const div = document.getElementById("content") as HTMLDivElement;
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    div,
);
