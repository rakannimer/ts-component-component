import * as React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  getNodeText,
  cleanup
} from "react-testing-library";
import Component from "../";

describe("Component-Component", () => {
  test("Renders", async () => {
    const didMount = jest.fn();
    const didUpdate = jest.fn();
    const willUnmount = jest.fn();
    const shouldUpdate = jest.fn().mockReturnValue(true);
    const getSnapshotBeforeUpdate = jest.fn().mockReturnValue(null);
    const { getByTestId } = render(
      <Component
        initialState={{ toggle: false }}
        {...{
          didMount,
          didUpdate,
          shouldUpdate,
          getSnapshotBeforeUpdate,
          willUnmount
        }}
      >
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
                  setState(s => ({ toggle: !s.toggle }));
                }}
              >
                toggle-button
              </button>
            </div>
          );
        }}
      </Component>
    );
    const result = await waitForElement(() =>
      getByTestId("toggle-value-false")
    );
    if (typeof result === "undefined") {
      throw new Error("Falsy result returned from waitForElement");
    }
    expect(getNodeText(result)).toEqual("false");
    const button = await waitForElement(() => getByTestId("toggle-button"));
    if (typeof button === "undefined") {
      throw new Error("Falsy result returned from waitForElement");
    }
    fireEvent.click(button);
    let updatedResult = await waitForElement(() =>
      getNodeText(getByTestId("toggle-value-true"))
    );
    if (typeof updatedResult === "undefined") {
      throw new Error("Falsy result returned from waitForElement");
    }
    expect(updatedResult).toEqual("true");
    expect(didMount.mock.calls.length).toEqual(1);
    expect(didUpdate.mock.calls.length).toEqual(1);
    expect(shouldUpdate.mock.calls.length).toEqual(1);
    cleanup();
    expect(willUnmount.mock.calls.length).toEqual(1);
  });
});
