import jwt from 'jsonwebtoken';
import AppContext from './../context';
import Helper from './../utils';

async function loginViaFbToken(token: string, {models}: AppContext) {
  const appId = process.env.APP_ID;
  const appSecret = process.env.APP_SECRET; 
  const jwtSecret = process.env.JWT_SECRET || '';
  const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
  const appAccessToenJson = await Helper.loadJson(appTokenUrl);
  const appAccessToken = appAccessToenJson.access_token;
  const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appAccessToken}`
  const accessTokenInfoJson = await Helper.loadJson(debugTokenUrl);
  const data = accessTokenInfoJson.data;
  if (data.is_valid && data.type == 'USER' && data.app_id == appId && data.user_id.length > 0) {
    let andEmail = ''
    if (data.scopes.includes('email')) {
      andEmail = ',email'
    }
    const getUserUrl = `https://graph.facebook.com/me?fields=id,name${andEmail}&access_token=${token}`
    const userJson = await Helper.loadJson(getUserUrl);
    const userObj = {
      fbId: userJson.id,
      name: userJson.name,
      email: userJson.email
    }
    const [user, ] = await models.User.findOrCreate({
      where: {fbId: userObj.fbId},
      defaults: userObj,
    });
    if (user.fbId == userObj.fbId) {
      const authorization = jwt.sign(
        { user_id: user.id },
        jwtSecret,
        { expiresIn: '1y' },
      );
      return authorization;
    }
  }
  return null;
}
async function loginViaCryptoToken(token: string) {
    const jwtSecret = process.env.JWT_SECRET;
    const tokenInfo = <{user_id:number}> await jwt.verify(token, jwtSecret!);
    const authorization = jwt.sign(
      { user_id: tokenInfo.user_id },
      jwtSecret!,
      { expiresIn: 60 },
    );
    return authorization;
}
export default async function login(parent: null, { input }: any, context: AppContext) {
  let authorization = null;
  if (input.authType == 'CRYPTO_TOKEN') {
    authorization = await loginViaCryptoToken(input.token);
  } else if (input.authType == 'FB_TOKEN') {
    authorization = await loginViaFbToken(input.token, context);
  } else {
    throw new Error('Unnown auth type');
  }
  if (context.connection != null) {
    context.connection.context.state.authorization = authorization;
  }
  return {
    authorization: authorization,
    clientMutationId: input.clientMutationId,
  }
}