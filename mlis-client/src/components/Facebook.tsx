import React, { Component } from 'react';
import FacebookLogin, { ReactFacebookLoginInfo } from 'react-facebook-login';
import LoginMutation from '../mutations/LoginMutation';
import { requireValue } from '../utils';

interface Props {
    onLogin: any,
}
export default class Facebook extends Component<Props> {
    state = {
        isRunning: false,
    }
    componentClicked = () => {
        this.setState({isRunning: true});
    }
    responseFacebook = (loginInfo: ReactFacebookLoginInfo) => {
        LoginMutation.commit(
            'FB_TOKEN',
            loginInfo.accessToken,
            this.props.onLogin
        );
    }
    render() {
        const appId = requireValue(process.env.REACT_APP_FB_APP_ID);
        if (this.state.isRunning) {
            return (
                <div>Loading...</div>
            );
        }
        return (
            <FacebookLogin
                appId={appId}
                autoLoad={false}
                disableMobileRedirect={true}
                fields="name,email,picture"
                onClick={this.componentClicked}
                callback={this.responseFacebook} />
        );
    }
}