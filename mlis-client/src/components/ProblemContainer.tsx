import * as React from 'react';
import { createRefetchContainer, RelayRefetchProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import ProblemSubmissionList from './ProblemSubmissionList';
import Facebook from './Facebook';
import Viewer from './Viewer';
import SubmitMutation from './../mutations/SubmitMutation';
import { ProblemContainer_main } from './__generated__/ProblemContainer_main.graphql';
import Panel from 'react-bootstrap/lib/Panel';
import Editor from 'react-simple-code-editor';
import * as prism from 'prismjs';
import 'prismjs/components/prism-python';
import '../css/prism.css';
import Button from 'react-bootstrap/lib/Button';
import { throttle } from 'throttle-debounce';
import { requireValue } from '../utils';

interface Props {
  relay: RelayRefetchProp,
  main: ProblemContainer_main,
}

class ProblemContainer extends React.Component<Props> {
  state = { code: 'Loading...' };
  constructor(props: Props) {
    super(props);
    let code = localStorage.getItem(this.savedCodeKey()) || requireValue(this.props.main.viewer).problem.codeTemplate;
    this.state = { code };
  }
  savedCodeKey = () => {
    const problemId = requireValue(this.props.main.viewer).problem.id;
    return `code:${problemId}`;
  }
  saveCode = (code: string) => {
    this.setState({code});
    throttle(500, () => {
      localStorage.setItem(this.savedCodeKey(), code);
    })();
  }
  _refetch = () => {
    this.props.relay.refetch(
      {},
      null,
      null,
      {force: true},
    );
  }
  _onLoad = (ev: ProgressEvent) => {
    const code = (ev.target as FileReader).result as string;
    this.saveCode(code);
  }
  _chooseFile(event: any) {
    const fileReader = new FileReader();
    fileReader.onload = this._onLoad;
    fileReader.readAsText(event.target.files[0]);
  }
  _submit = () => {
    SubmitMutation.commit(
      this.props.relay.environment,
      this.props.main.viewer!.problem.id,
      this.state.code
    );
  }
  render() {
    if (this.props.main.viewer == null) {
      return (
        <Facebook onLogin={this._refetch}/>
      )
    }
    return (
      <div>
        <Viewer viewer={this.props.main.viewer} onLogout={this._refetch} />
        <Panel>
          <Panel.Heading>
            <Panel.Title>{this.props.main.viewer.problem.name}</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <pre>
            {this.props.main.viewer.problem.text}
            </pre>
          </Panel.Body>
        </Panel>
        <input
          type="file"
          onChange={this._chooseFile.bind(this)}
        />
        <Editor
          value={this.state.code}
          onValueChange={code => this.saveCode(code)}
          highlight={code => prism.highlight(code, prism.languages.python, 'python')}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
        <Button onClick={this._submit} bsStyle="primary" block>Submit</Button>
        <ProblemSubmissionList problem={this.props.main.viewer.problem} />
      </div>
    );
  }
}

export default createRefetchContainer(
    ProblemContainer,
    {
      main: graphql`
        fragment ProblemContainer_main on Main @argumentDefinitions(
          id: { type: "ID!" }
        ) {
          viewer {
            ...Viewer_viewer
            problem(id:$id) {
              id
              name
              text
              codeTemplate
              ...ProblemSubmissionList_problem
            }
          }
        }`,
    },
    graphql`
      query ProblemContainerQuery($id: ID!) {
        main {
          ...ProblemContainer_main @arguments(id: $id)
        }
      }`
);