import React from "react";
import { renderAndAddProps } from "render-and-add-props";
function cleanProps<T>(props: ComponentProps<T>): Partial<ComponentProps<T>> {
  let {
    initialState,
    getInitialState,
    refs,
    getRefs,
    didMount,
    didUpdate,
    willUnmount,
    getSnapshotBeforeUpdate,
    shouldUpdate,
    didCatch,
    render,
    ...rest
  } = props;
  return rest;
}

export type ChildProps<T> = {
  setState: Component<T>["_setState"];
  forceUpdate: Component<T>["_forceUpdate"];
  state: State<T>;
  props: Props<T>;
  refs: Component<T>["_refs"];
};

export type ChildPropsWithoutMutators<T> = {
  state: State<T>;
  props: Props<T>;
  refs: React.Component["refs"];
};

export type ChildPropsWithPrev<T> = {
  state: State<T>;
  props: Props<T>;
  refs: React.Component["refs"];
  prevProps: Props<T>;
  prevState: State<T>;
  setState: Component<T>["_setState"];
  forceUpdate: Component<T>["_forceUpdate"];
};

export type ChildPropsWithNextWithoutMutators<T> = {
  state: State<T>;
  props: Props<T>;
  nextProps: Props<T>;
  nextState: State<T>;
};

type ComponentProps<T> = {
  initialState?: T;
  getInitialState?: (props: ComponentProps<T>) => T;
  refs?: any;
  getRefs?: any;
  didMount?: (args: ChildProps<T>) => void;
  didUpdate?: React.Component["componentDidUpdate"];
  willUnmount?: (
    args: ChildPropsWithoutMutators<T>
  ) => (args: ChildProps<T>) => void;
  getSnapshotBeforeUpdate?: (
    args: ChildPropsWithPrev<T>
  ) => (args: ChildProps<T>) => void;
  didCatch?: (args: ChildProps<T>, error: any, info: any) => void;
  shouldUpdate?: (args: ChildPropsWithNextWithoutMutators<T>) => boolean;
  render?: ((
    { setState, forceUpdate, state, props, refs }: ChildProps<T>
  ) => JSX.Element);
  children?: ((
    { setState, forceUpdate, state, props, refs }: ChildProps<T>
  ) => JSX.Element);
  [otherProps: string]: any;
};

type Props<T> = ComponentProps<T>;
type State<T> = Readonly<T>;
export class Component<T> extends React.Component<Props<T>, State<T>> {
  static defaultProps = {
    getInitialState: () => {},
    getRefs: () => ({})
  };
  constructor(props: Props<T>) {
    super(props);
    if (this.props.initialState) {
      this.state = this.props.initialState;
    } else if (this.props.getInitialState) {
      this.state = this.props.getInitialState(this.getArgs());
    }
  }
  _refs = (this.props.refs || this.props.getRefs(this.getArgs())) as any;
  _setState: React.Component<Props<T>, T>["setState"] = (
    newStateOrReducer,
    callback
  ) => this.setState(newStateOrReducer, callback);

  _forceUpdate: (callback?: (() => void) | undefined) => void = () =>
    this.forceUpdate();
  getArgs() {
    const {
      state,
      props,
      _setState: setState,
      _forceUpdate: forceUpdate,
      _refs: refs
    } = this;
    return {
      state,
      props: cleanProps(props),
      refs,
      setState,
      forceUpdate
    };
  }
  componentDidMount() {
    if (this.props.didMount) this.props.didMount(this.getArgs());
  }
  shouldComponentUpdate(nextProps: ComponentProps<T>, nextState: T) {
    if (this.props.shouldUpdate)
      return this.props.shouldUpdate({
        props: this.props,
        state: this.state,
        nextProps: cleanProps(nextProps),
        nextState
      });
    else return true;
  }
  componentWillUnmount() {
    if (this.props.willUnmount)
      this.props.willUnmount({
        state: this.state,
        props: cleanProps(this.props),
        refs: this._refs
      });
  }
  componentDidUpdate(prevProps: Props<T>, prevState: State<T>, snapshot: T) {
    if (this.props.didUpdate)
      this.props.didUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState
        }),
        snapshot
      );
  }
  getSnapshotBeforeUpdate(prevProps: Props<T>, prevState: State<T>) {
    if (this.props.getSnapshotBeforeUpdate) {
      return this.props.getSnapshotBeforeUpdate(
        Object.assign(this.getArgs(), {
          prevProps: cleanProps(prevProps),
          prevState
        })
      );
    } else {
      return null;
    }
  }
  componentDidCatch(error: any, info: any) {
    if (this.props.didCatch) {
      this.props.didCatch(this.getArgs(), error, info);
    }
  }
  render() {
    const { children, render } = this.props;
    return render
      ? renderAndAddProps(render, this.getArgs())
      : typeof children === "function"
        ? renderAndAddProps(children, this.getArgs())
        : children || null;
  }
}
export default Component;
