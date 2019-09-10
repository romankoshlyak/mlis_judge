import * as React from 'react';
import { createFragmentContainer, RelayProp } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';
import { throttle } from 'throttle-debounce';
import Panel from 'react-bootstrap/lib/Panel';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Editor from 'react-simple-code-editor';
import * as prism from 'prismjs';
import 'prismjs/components/prism-python';
import '../css/prism.css';
import { SubmissionEditor_problem } from './__generated__/SubmissionEditor_problem.graphql';
import SubmitMutation from './../mutations/SubmitMutation';
import { assertTrue } from '../utils';

interface Props {
  relay: RelayProp,
  problem: SubmissionEditor_problem,
  style?: React.CSSProperties,
}

class SubmissionEditor extends React.Component<Props> {
  state = { code: 'Loading...' };
  constructor(props: Props) {
    super(props);
    let code = localStorage.getItem(this.savedCodeKey()) || props.problem.codeTemplate;
    this.state = { code };
  }
  savedCodeKey = () => {
    const problemId = this.props.problem.id;
    return `code:${problemId}`;
  }
  saveCode = (code: string) => {
    this.setState({code});
    throttle(500, () => {
      localStorage.setItem(this.savedCodeKey(), code);
    })();
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
    const problem = this.props.problem;
    assertTrue(problem.testSets.edges.length === 1);
    SubmitMutation.commit(
      this.props.relay.environment,
      problem.id,
      problem.testSets.edges[0].node.id,
      this.state.code
    );
  }
  render() {
    return (
        <Panel defaultExpanded style={this.props.style}>
          <Panel.Heading>
            <Panel.Title>
              <Panel.Toggle>
                Editor
              </Panel.Toggle>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
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
            <ButtonGroup vertical block>
              <Button onClick={this._submit} bsStyle="primary">Submit</Button>
              <label className="btn btn-primary">
                Load code from file
                <input
                  type="file"
                  style={{display: 'none'}}
                  onChange={this._chooseFile.bind(this)} />
              </label>
            </ButtonGroup>
          </Panel.Collapse>
        </Panel>
    );
  }
}

export default createFragmentContainer(SubmissionEditor, {
  problem: graphql`
    fragment SubmissionEditor_problem on Problem {
      id
      name
      text
      codeTemplate
      testSets(last: 1000) @connection(key: "SubmissionEditor_testSets") {
        edges {
          node {
          id
          }
        }
      }
    }
  `,
});
