import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Icon } from 'react-native-elements';
import { Colors } from '../util/Values';

export default class PrivacyPolicy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_OPENED_PRIVACY_POLICY');
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressTerms = () => {

  }

  onPressCompanyInformation = () => {

  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
          <Text style={styles.termsText}>
            <Text style={styles.termsSectionTitle}>
              1. Introduction{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>1.1. </Text>
            This privacy policy (&quot;<Text style={styles.termsEmphasis}>this Policy</Text>&quot;) of Jupiter Savings SA (Pty) Ltd (&quot;<Text style={styles.termsEmphasis}>Jupiter</Text>&quot;, &quot;<Text style={styles.termsEmphasis}>us</Text>&quot; or &quot;<Text style={styles.termsEmphasis}>we</Text>&quot;) contractually regulates our right to collect and use certain of your information as a customer (&quot;<Text style={styles.termsEmphasis}>User</Text>&quot; or &quot;<Text style={styles.termsEmphasis}>you</Text>&quot;) and your rights in this regard, and applies to your use of Jupiter&apos;s website (www.jupitersave.com including all jupitersave.com sub-domains) (&quot;<Text style={styles.termsEmphasis}>Website</Text>&quot;) and Jupiter&apost;s app as downloaded from the Google Play Store or Apple App Store (&quot;<Text style={styles.termsEmphasis}>App</Text>&quot;)  and the services that we offer (&quot;<Text style={styles.termsEmphasis}>Services</Text>&quot;) through our platform made available through the App and Website (collectively referred to as the &quot;<Text style={styles.termsEmphasis}>Platform</Text>&quot;). It also applies any other time that we process your information. This Policy creates a legally binding agreement between us and you and will apply as soon as we collect your data, or you start using the Platform or Services.
            {"\n"}
            <Text style={styles.termsParaNumber}>1.2. </Text>
            Your use of the Platform and Services will be regulated by this Policy as well as any other terms that are available on the Platform and/or the agreements that you enter into with us. 
            {"\n"}
            <Text style={styles.termsParaNumber}>1.3. Changes to this Policy: </Text>
            we may change this Policy from time to time in line with any changes that the law or our internal business operations require, and we will notify you of any material changes to this Policy. The current version of this Policy that applies each time you visit and/or use our Platform and/or Services will regulate our relationship. You must therefore consider the Policy each time you visit the Platform. If you do not agree with any terms of this Policy, the only remedy is to stop your use of our Platform and/or Services.
            <Text style={styles.termsParaNumber}>1.4. </Text>
            The right to privacy and this Policy is important to us. We are committed to taking steps to protect your privacy when you use the Platform and Services and we therefore implement business practices that comply with the Protection of Personal Information Act, 4 of 2013 (referred to as &quot;<Text style={styles.termsEmphasis}>Applicable Law</Text>&quot; in this Policy). In this Policy, we explain how we will use and protect your Personal Information in terms of Applicable Law.
            {"\n"}{"\n"}
            
            <Text style={styles.termsSectionTitle}>
              2. Personal information{"\n"}
            </Text>
            Where we refer to &quot;<Text style={styles.termsEmphasis}>Personal Information</Text>&quot; in this Policy, we mean personal information as defined in Applicable Law, being information that may be used to directly or indirectly identify you. Personal Information includes, for example, your name, surname, email address, identity number, contact details, photograph and location.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              3. Collecting your Personal Information{"\n"}
            </Text>
            We collect Personal Information about you from the following sources:
            {"\n"}
            <Text style={styles.termsParaNumber}>3.1. </Text> directly from you when you provide it to us, such as when you sign up and use the Platform and Services, contact us or through the course of our relationship with you;
            {"\n"}
            <Text style={styles.termsParaNumber}>3.2. </Text> from public sources where you have made your Personal Information public, such as on social media;
            {"\n"}
            <Text style={styles.termsParaNumber}>3.3. </Text> from your use of our Platform or use of any features or resources available on or through our Platform; and
            {"\n"}
            <Text style={styles.termsParaNumber}>3.4. </Text> from third parties when you interact with them through the Platform, where they are authorised to share your Personal Information or your interaction with us as a result of the Services or as required of the third parties to share it with us or otherwise if Applicable Law allows us
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              4. Categories of personal information that we process{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>4.1. General personal details:</Text> your name and surname, gender, date of birth, age, nationality, language preferences, identity or passport number.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.2. Contact details:</Text> your address, contact number, email address, public social media profile(s).
            {"\n"}
            <Text style={styles.termsParaNumber}>4.3. Account details:</Text> such as your username, password, usage data, and aggregate statistical information.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.4. User information:</Text> Personal Information included in correspondence, transaction documents, use of the Services or other materials that we process in the course of providing the Services.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.5. Consent records:</Text> records of any consents you have given us in respect of using your Personal Information and any related information, such as the specific details of the consent. We will also record any withdrawals or refusals of consent.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.6. Payment details:</Text> payment method, information provided by payment gateway service provider, payment amount, date and reason for payment and related information.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.7. Data relating to our Platform:</Text> such as the type of device you use to access the Platform, the operating system and browser, browser settings, IP address, dates and times of connecting to and using the Platform and other technical communications information. 
            {"\n"}
            <Text style={styles.termsParaNumber}>4.8. Cookies and other technologies.</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>4.9. Content and advertising data:</Text> records of your interactions with our online advertising on the various websites which we advertise and records relating to content displayed on webpages displayed to you, sent by email or SMS or other means, and within the Platform.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.10. Views and opinions:</Text> any views and opinions that you choose to share with us, or publicly post about us on social media platforms or elsewhere.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              5. Purposes of processing personal information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>5.1. </Text> We only process adequate and relevant Personal Information for the following purposes and legal bases: 
            {"\n"}5.1.1. to perform in terms of our agreement with you (provide you with the Services and access to the Platform);
            {"\n"}5.1.2. operate and manage your account or your relationship with us;
            {"\n"}5.1.3. monitor and analyse our business to ensure that it is operating properly, for financial management and for business-development purposes;
            {"\n"}5.1.4. contact you by email, SMS, push notifications or other means, such as WhatsApp, instant messaging services and phone calls, to inform you about our Services, including for marketing purposes, unless you have opted-out of such communications (direct marketing); 
            {"\n"}5.1.5. form a view of you as an individual and to identify, develop or improve the Platform and Services that may interest you;
            {"\n"}5.1.6. carry out market research and surveys, business and statistical analysis and necessary audits;
            {"\n"}5.1.7. fraud prevention;
            {"\n"}5.1.8. perform other administrative and operational tasks like testing our processes and systems and ensuring that our security measures are appropriate and adequate; and
            {"\n"}5.1.9. comply with our regulatory, legal or other obligations.
            {"\n"}
            <Text style={styles.termsParaNumber}>5.2. </Text>In addition to the above purposes, we may use your Personal Information for other purposes if the law allows for it, if you consent to it, or if it is in the public interest to do so. All purposes for the processing of your Personal Information will be allowed in terms of Applicable Law.

            {"\n"}{"\n"}
            <Text style={styles.termsSectionTitle}>
              6. Direct marketing{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>6.1. </Text>We may process your Personal Information to contact you to provide you with information about our Services that may be of interest to you. Where we provide Services to you (where you are a customer of ours), we may send information to you about our Services and other relevant information. We will only send you direct marketing communications if you are a customer or where you have consented to us sending you direct marketing or otherwise in compliance with Applicable Law.
            {"\n"}
            <Text style={styles.termsParaNumber}>6.2. </Text>You may unsubscribe from any direct marketing communications at any time by clicking on the unsubscribe link that we include in every direct marketing communication, in your account settings on the Platform or by contacting us and requesting us to do so. 
            {"\n"}
            <Text style={styles.termsParaNumber}>6.3. </Text>After you unsubscribe, we will not send you any direct marketing communications, but we will continue to contact when necessary in connection with providing you with the Services or in connection with our business. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              7. Disclosure of Personal Information to third parties{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>7.1. </Text>We will keep your Personal Information confidential and only share it with others in terms of this Policy, or if you consent to it, or if the law requires from us to share it. We may disclose your Personal Information to:
            {"\n"}
            <Text style={styles.termsParaNumber}>7.2. </Text>If we engage third party processors to process your Personal Information, the processors will only be appointed in terms of a written agreement which will require the third parties to only process Personal Information on our written instructions, use appropriate measures to ensure the confidentiality and security of your Personal Information and comply with any other requirements set out in the agreement and required by Applicable Law. 
            {"\n"}
            <Text style={styles.termsParaNumber}>7.3. </Text>Our Platform may connect to various social media websites or apps, including, but not limited to, Facebook, Twitter, LinkedIn, Instagram. If you choose to share certain aspects about your Jupiter experience on social media or link your social media account, we will share your Personal Information with the relevant social media websites or apps.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              8. International transfers of Personal information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>8.1. </Text>Due to the nature of the Services and our business being established in different countries, we may need to transfer Personal Information to and from the different countries for our business purposes. 
            {"\n"}
            <Text style={styles.termsParaNumber}>8.2. </Text>We may transfer your Personal Information to recipients in other countries, but we will only transfer Personal Information to third parties in countries with adequate data protection laws or do so in terms of a written agreement with the recipient which imposes data protection requirements on that party as required by Applicable Law. 
            {"\n"}
            <Text style={styles.termsParaNumber}>8.3. </Text>Please note that when you transfer any Personal Information directly to a third party in another country (i.e. we do not send your Personal Information to the third party), Jupiter is not responsible for that transfer of Personal Information (and such transfer is not based on or protected by this Policy). Any Personal Information that we receive from a third party country will nevertheless be processed in terms of this Policy. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              9. Security{"\n"}
            </Text>

            <Text style={styles.termsParaNumber}>9.1. </Text>We have implemented appropriate technical and organisational security measures designed to protect Personal Information against accidental or unlawful destruction, loss, alteration, disclosure, access and other unlawful or unauthorised forms of processing. These measures are in accordance with Applicable Law.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.2. </Text>The internet is an open and often vulnerable system and the transfer of information via the internet is not completely secure. Although we will implement all reasonable measures to protect Personal Information, we cannot guarantee the security of your Personal Information transferred to us using the internet. <Text style={styles.termsEmphasis}>Therefore, you acknowledge and agree that any transfer of Personal Information via the internet is at your own risk and you are responsible for ensuring that any Personal Information that you send is sent securely and maintaining the secrecy of your account access details.</Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              10. Your legal rights{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>10.1. </Text>You have certain rights in relation to your Personal Information  under Applicable Law:
            {"\n"}
            10.1.1. right of access: the right to be informed of and request access to the Personal Information that we process about you;
            {"\n"}
            10.1.2. right to rectification and erasure: you may request that your Personal Information be amended or updated where it is inaccurate or incomplete or that we delete your Personal Information, subject to applicable limitations and exceptions;
            {"\n"}
            10.1.3. right to restrict processing: you may request that we temporarily or permanently stop processing your Personal Information;
            {"\n"}
            10.1.4. right to object: 
            {"\n"}
                10.1.4.1. you may object to us processing your Personal Information; and
                10.1.4.2. to your Personal Information being processed for direct marketing purposes;
            10.1.5. right not to be subject to automated decision-making: where a decision that has a legal or other significant effect is based solely on automated decision making, including profiling, you may request that your Personal Information not be processed in that manner.
            {"\n"}
            <Text style={styles.termsParaNumber}>10.2. </Text>Where you have provided consent for us to process your Personal Information, you may also withdraw your consent where our processing is based on your consent. However, we may continue to process your Personal Information if another legal justification exists for the processing.
          {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              11. Use of Cookies and similar technologies{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>11.1. </Text>Cookies are small files about browsing activity that are stored on a device's web browser by the websites that are visited and are generally used to improve user experience. When you use the Platform, we automatically receive and record information on our server logs from your browser, such as your location, IP address, general internet usage and Google Analytics information. This is statistical data about browsing actions and patterns. Cookies enable us to improve our Platform and Services, estimate our audience size and usage patterns, and store information about your preferences.
            {"\n"}
            <Text style={styles.termsParaNumber}>11.2. </Text>You can set your web browser to refuse cookies or by downloading and installing the Google Analytics Opt-out Browser Add-on, but your full use of the Platform might be limited. Please note that third parties may also use cookies, but we do not have access to, or control over them, and therefore cannot take responsibility for them. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              12. Links on our platform{"\n"}
            </Text>
            Our Platform may include links to other apps or third party websites which do not fall under our supervision. We cannot accept any responsibility for your privacy or the content of these third party sites, but we display these links in order to make it easier for you to find information about specific subjects. <Text style={styles.termsEmphasis}>If you use or rely on these links, you do so at your own risk.</Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              13. Right to object{"\n"}
            </Text>
            You may, on reasonable grounds, object to us using your Personal Information for certain purposes. If you object, we will stop using your Personal Information, except if Applicable Law allows its use. To exercise this right or to discuss it with us, please contact us on <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              14. Children&quot;s information and special personal information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>14.1. </Text>We do not intentionally collect or use children&quot;s Personal Information without the consent of a parent or guardian of the child unless the child can lawfully give its own consent in terms of Applicable Laws, and has given the consent. 
            {"\n"}
            <Text style={styles.termsParaNumber}>14.2. </Text>We will only collect or process sensitive Personal Information with your consent or if allowed by Applicable Law.

            <Text style={styles.termsSectionTitle}>
              15. Quality and access to your information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>15.1. Quality:</Text> we want to ensure that your Personal Information is accurate and up to date. You may ask us to correct or remove any Personal Information that you think is inaccurate, by sending us an email on <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>. 
            {"\n"}
            <Text style={styles.termsParaNumber}>15.2. Access:</Text> you have the right to request that we provide you with Personal Information that we hold about you. You must contact us directly to do so or send an email to <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>. This request may be subject to an access to information request in terms of Applicable Laws and may require you to verify your identity, identify the rights you are wishing to exercise and pay a fee. 
            {"\n"}
            <Text style={styles.termsParaNumber}>15.3. </Text>The right to access your Personal Information may further be limited in terms of Applicable Law.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              16. Retention of information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>16.1. </Text>We take every reasonable step to ensure that your Personal Information is only processed for the minimum period necessary for the purposes set out in this Policy.
            <Text style={styles.termsParaNumber}>16.2. </Text>We retain Personal Information in accordance with the required retention periods in Applicable Law or for legitimate business purposes and for the time necessary establish, exercise or defend any legal rights. We will only retain your Personal Information for the purposes explicitly set out in this Policy. We may keep Personal Information indefinitely in a de-identified format for statistical purposes, which may include for example statistics of how you use the Platform and Services. 
            <Text style={styles.termsParaNumber}>16.3. </Text>This Policy also applies when we retain your Personal Information. 

            <Text style={styles.termsSectionTitle}>
              17. Security breach{"\n"}
            </Text>
            We will report any security breach to the applicable regulatory authority in terms of Applicable Law and to the individuals or companies whose Personal Information is involved in the breach. If you want to report any concerns about our privacy practices or if you suspect any breach regarding your Personal Information, kindly notify us by sending an email to <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              18. Lodging a complaint{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>18.1. </Text>If you want to raise any objection or have any queries about our privacy practices, you can contact our data protection officer on <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>. 
            {"\n"}
            <Text style={styles.termsParaNumber}>18.2. </Text>You also have the right to formally lodge a complaint with the Information Regulator: 
            {"\n"}
            <Text style={styles.termsParaNumber}>18.3. </Text>Website: http://www.justice.gov.za/inforeg/index.html
            {"\n"}
            <Text style={styles.termsParaNumber}>18.4. </Text>Address: SALU Building, 316 Thabo Sehume Street, Pretoria
            {"\n"}
            <Text style={styles.termsParaNumber}>18.5. </Text>Tel: 012 406 4818
            {"\n"}
            <Text style={styles.termsParaNumber}>18.6. </Text>Fax: 086 500 3351
            {"\n"}
            <Text style={styles.termsParaNumber}>18.7. </Text>Email: inforeg@justice.gov.za
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              19. Legal disclosure{"\n"}
            </Text>

            <Text style={styles.termsParaNumber}>19.1. Platform provider: </Text>Jupiter Savings SA (Pty) Ltd (trading as &quot;Jupiter&quot;), company registration number 2019/174659/07. 
            {"\n"}
            <Text style={styles.termsParaNumber}>19.2. Legal status: </Text>Jupiter is a private company, duly incorporated in terms of the applicable laws of the Republic of South Africa.
            {"\n"}
            <Text style={styles.termsParaNumber}>19.3. Directors: </Text>LS Jordan and A Brijmohun.
            {"\n"}
            <Text style={styles.termsParaNumber}>19.4. Description of main business of Jupiter: </Text>Jupiter is a fintech business which aims to create and grow the savings pools of South Africans of all income levels by giving them access to savings options at low minimum entry requirements. In addition, Jupiter aims to encourage users to save higher amounts through the use of machine learning to drive incentives, boosts, rewards and games to our client bases.
            {"\n"}
            <Text style={styles.termsParaNumber}>19.5. Email address: </Text><Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>19.6. Website address: </Text><Text style={styles.termsLink}>www.jupitersave.com</Text> 
            {"\n"}
            <Text style={styles.termsParaNumber}>19.7. Registered address: </Text>Unit 0208 Civic Towers, corner of Stiemens and Biccard Street, Braamfontein, Gauteng, South Africa, 2001.
            {"\n"}
            <Text style={styles.termsParaNumber}>19.8. Physical and postal address: </Text>The Link Tower, 173 Oxford Road, Rosebank, Gauteng, 2196.

          </Text>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  scrollView: {
    marginTop: 20,
    marginBottom: 20,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  termsText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
  },
  termsSectionTitle: {
    fontFamily: 'poppins-semibold'
  },
  termsParaNumber: {
    fontFamily: 'poppins-semibold'
  },
  termsEmphasis: {
    fontFamily: 'poppins-semibold'
  },
  termsLink: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE
  }
});
