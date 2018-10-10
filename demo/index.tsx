import * as ReactDOM from "react-dom";
import * as React from "react";

import { Component } from "../src/";

ReactDOM.render(
  <Component initialState={{ toggle: false }}>
    {({ state, setState }) => {
      return (
        <div data-testid="toggle">
          {state.toggle === true && (
            <div data-testid="toggle-value-true">
              {JSON.stringify(state.toggle)}
            </div>
          )}
          {state.toggle === false && (
            <div data-testid="toggle-value-false">
              {JSON.stringify(state.toggle)}
            </div>
          )}
          <button
            data-testid="toggle-button"
            onClick={() => {
              setState({ toggle: !state.toggle });
            }}
          >
            Toggle
          </button>
        </div>
      );
    }}
  </Component>,
  document.getElementById("app")
);
