import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import { ChangeEvent } from 'react';

const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

interface Props extends React.HTMLProps<HTMLInputElement> {
  className?: string,
  commitOnBlur?: boolean,
  initialValue?: string | null,
  onDelete?: () => void,
  onCancel?: () => void,
  onSave: (text: string) => void,
  placeholder?: string,
}

export default class ProblemTextInput extends React.Component<Props> {
  static defaultProps = {
    commitOnBlur: false,
  };
  static propTypes = {
    className: PropTypes.string,
    commitOnBlur: PropTypes.bool.isRequired,
    initialValue: PropTypes.string,
    onCancel: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  };
  state = {
    isEditing: false,
    text: this.props.initialValue || '',
  };
  componentDidMount() {
    const element = ReactDOM.findDOMNode(this) as HTMLElement
    element.focus();
  }
  _commitChanges = () => {
    const newText = this.state.text.trim();
    if (this.props.onDelete && newText === '') {
      this.props.onDelete();
    } else if (this.props.onCancel && newText === this.props.initialValue) {
      this.props.onCancel();
    } else if (newText !== '') {
      this.props.onSave(newText);
      this.setState({text: ''});
    }
  };
  _handleBlur = () => {
    if (this.props.commitOnBlur) {
      this._commitChanges();
    }
  };
  _handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({text: (e.target as HTMLInputElement).value});
  };
  // FIXME: KeyboardEvent in the global.d.ts file that ships with react.d.ts is not generic
  // _handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  _handleKeyDown = (e: any) => {
    if (this.props.onCancel && e.keyCode === ESC_KEY_CODE) {
      this.props.onCancel();
    } else if (e.keyCode === ENTER_KEY_CODE) {
      this._commitChanges();
    }
  };
  render() {
    return (
      <input
        className={this.props.className}
        onBlur={this._handleBlur}
        onChange={this._handleChange}
        onKeyDown={this._handleKeyDown}
        placeholder={this.props.placeholder}
        value={this.state.text}
      />
    );
  }
}
