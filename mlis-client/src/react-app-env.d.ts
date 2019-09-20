/// <reference types="react-scripts" />
declare module 'babel-plugin-relay/macro' {
	export { graphql } from 'react-relay'
}
declare module 'react-facebook' {
	const FacebookProvider: any;
	const Comments: any;
	export {FacebookProvider, Comments};
}