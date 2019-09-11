import * as React from 'react';
import Panel from 'react-bootstrap/lib/Panel';

interface Props {
}

export default class PrivacyPolicy extends React.Component<Props> {
  render() {
    return (
      <Panel>
        <Panel.Body>
          <h1>Privacy Policy</h1>
          <p>
            This privacy policy discloses the privacy practices for MLIS platform. This privacy policy applies solely to information collected by www.mlisjudge.com and by MLIS application. It will notify you of the following:
          </p>
          <ol>
            <li>
              What personally identifiable information is collected from you through the web site and appliation, how it is used and with whom it may be shared.
            </li>
            <li>
              What choices are available to you regarding the use of your data.
            </li>
            <li>
              The security procedures in place to protect the misuse of your information.
            </li>
            <li>
              How you can correct any inaccuracies in the information.
            </li>
          </ol>
          <h2>
            Information Collection, Use, and Sharing
          </h2>
          <p>
            We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us. We will not sell or rent your privacy information to anyone.
          </p>
          <p>
            We will use your information to respond to you, regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request, e.g. to ship an order.
          </p>
          <p>
            Unless you ask us not to, we may contact you via email (or in other way) in the future to tell you about specials, new products or services, or changes to this privacy policy.
          </p>
          <p>
            We publically share some of the information that you provide us. Currently we share your name, profile picture and link to your Facebook page and your solutions to the problems. In future we can share more information.
          </p>
          <h2>
            Your Access to and Control Over Information
          </h2>
          <p>
            You may opt out of any future contacts from us at any time. You can do the following at any time by contacting us via the email address given on our website:
          </p>
          <ul>
            <li>
              See what data we have about you, if any.
            </li>
            <li>
              Correct any data we have about you.
            </li>
            <li>
              Express any concern you have about our use of your data.
            </li>
          </ul>
          <h2>
            Security
          </h2>
          <p>
            We are young start up and don't have good security at place at the moment. At this point, please provide us only with data that you okay to be shared publicly. We promise to invest in security once we have more resources.
          </p>
          <h2>
            Updates
          </h2>
          <p>
            Our Privacy Policy may change from time to time and all updates will be posted on this page or somewhere else on our site.
          </p>
          <p>
            If you feel that we are not abiding by this privacy policy, you should contact us immediately via email at mlisserver@gmail.com
          </p>
          <h2>
            Registration
          </h2>
          <p>
            In order to use this website (application), a user must first complete the registration. During registration a user is required to give certain information (such as name and email address and other). This information is used to contact you about the products/services on our site in which you have expressed interest. This information also used in order to improve our service.
          </p>
          <h2>
            Cookies
          </h2>
          <p>
            We use "cookies" on this site. A cookie is a piece of data stored on a site visitor's hard drive to help us improve your access to our site and identify repeat visitors to our site. For instance, when we use a cookie to identify you, you would not have to log in, thereby saving time while on our site. Cookies can also enable us to track and target the interests of our users to enhance the experience on our site.
          </p>
          <p>
            Some of our business partners may use cookies on our site (for example, advertisers). However, we have no access to or control over these cookies.
          </p>
          <h2>
            Links
          </h2>
          <p>
            This web site contains links to other sites. Please be aware that we are not responsible for the content or privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.
          </p>
        </Panel.Body>
      </Panel>
    );
  }
}