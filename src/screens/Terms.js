import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Icon } from 'react-native-elements';
import { Colors } from '../util/Values';

export default class Terms extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent("USER_ENTERED_SCREEN", {"screen_name": "Terms"});
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressPrivacy = () => {
    this.props.navigation.navigate('PrivacyPolicy');
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
          <Text style={styles.headerTitle}>Commercial terms and conditions</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
          <Text style={styles.termsText}>
            <Text style={styles.termsEmphasis}>Last updated: November 2019{"\n"}</Text>
            All clauses in these Terms displayed in <Text style={styles.termsEmphasis}>BOLD</Text> are provisions which limit the risk or liability of Jupiter and constitute an assumption of risk or liability by you, impose an obligation on you to indemnify Jupiter or is an acknowledgement of a fact by you. Please read these clauses carefully before agreeing to these Terms.
            {"\n"}{"\n"}
            <Text style={styles.termsSectionTitle}>
              1. Disclaimer{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>1.1. </Text>
            <Text style={styles.termsEmphasis}>All information provided on the Platform or with the Services is provided for information purposes only. Jupiter is a financial services provider authorised to provide intermediary services and does not provide any financial advice. If you require financial advice, it is your responsibility to engage the services of a registered financial advisor.</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>1.2. </Text>
            <Text style={styles.termsEmphasis}>Any reliance you place on any information on the Platform or provided with the Services is strictly at your own risk and should not be viewed as or relied on as advice. You are responsible for deciding whether the Services and your use thereof is appropriate for you based on your personal circumstances. Jupiter will not accept any responsibility for any loss whatsoever which may arise from reliance on information or materials published on the Platform or with the Services.</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>1.3. Changes to this Policy: </Text>
            <Text style={styles.termsEmphasis}>All information provided on the Platform and with the Services is the intellectual property of Jupiter and are subject to these Terms and applicable laws.</Text>
            {"\n"}{"\n"}
            
            <Text style={styles.termsSectionTitle}>
              2. Interpretation and definitions{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>2.1. </Text>&quot;<Text style={styles.termsEmphasis}>Account</Text>&quote; means your account through which you access the Platform and transact with Jupiter;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.2. </Text>&quot;<Text style={styles.termsEmphasis}>App</Text>&quot; means the Jupiter Savings app as downloaded from the Google Play Store or Apple App Store;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.3. </Text>&quot;<Text style={styles.termsEmphasis}>Asset Manager</Text>&quot; means our third party partner that manages the aggregated Capital Savings on our behalf, Allan Gray Proprietary Limited, an authorised financial services provider in terms of the Financial Advisory and Intermediary Services Act, 2002, and its subsidiaries and affiliates;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.4. </Text>&quot;<Text style={styles.termsEmphasis}>Boosts</Text>&quot; or &quot;<Text style={styles.termsEmphasis}>Rewards</Text>&quot; mean the benefits that you receive as a result of your use of the Services;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.5. </Text>&quot;<Text style={styles.termsEmphasis}>Capital Savings&quot;</Text> means the money that you save through the Services;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.6. </Text>&quot;<Text style={styles.termsEmphasis}>Fees&quot;</Text> means the fees described in clause 8;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.7. </Text>&quot;<Text style={styles.termsEmphasis}>Interest&quot;</Text> means the interest earned on Capital Savings less the Service Fee;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.8. </Text>&quot;<Text style={styles.termsEmphasis}>Jupiter Balance&quot;</Text> means the balance of your Capital Savings, Interest and Boosts and Rewards earned through the Services and as reflected on the MoneyWheel on the App; 
            {"\n"}
            <Text style={styles.termsParaNumber}>2.9. </Text>&quot;<Text style={styles.termsEmphasis}>Jupiter</Text>&quot;, &quot;<Text style={styles.termsEmphasis}>us</Text>&quot; or &quot;<Text style={styles.termsEmphasis}>we</Text>&quot; means Jupiter Savings SA Proprietary Limited (company registration number 2019/174659/07), a private company incorporated in terms of the laws of the Republic of South Africa, with its physical address at Unit 0208 Civic Towers, corner of Stiemens and Biccard Street, Braamfontein, Gauteng, South Africa, 2001; 
            {"\n"}
            <Text style={styles.termsParaNumber}>2.10. </Text>&quot;<Text style={styles.termsEmphasis}>MoneyWheel&quot;</Text> means the feature on the App that displays your Jupiter Balance;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.11. </Text>&quot;<Text style={styles.termsEmphasis}>Personal Information&quot;</Text> means all information about you that can be used to identify you as defined in the Protection of Personal Information Act 4 of 2013;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.12. </Text>&quot;<Text style={styles.termsEmphasis}>Platform</Text>&quote; means the Website and App collectively through which you access the Services and which forms part of the Services;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.13. </Text>&quot;<Text style={styles.termsEmphasis}>Privacy Policy</Text>&quote; means the policy available on the Platform setting out how we use Personal Information;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.14. </Text>&quot;<Text style={styles.termsEmphasis}>Service Fee</Text>&quote; means a portion of the Interest retained by Jupiter for the Services;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.15. </Text>&quot;<Text style={styles.termsEmphasis}>Services</Text>&quote; means the services supplied by Jupiter to Users, which includes the Platform;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.16. </Text>&quot;<Text style={styles.termsEmphasis}>Terms</Text>&quote; means means these terms in this legally binding agreement that regulate your use of the Services and our relationship with you;
            {"\n"}
            <Text style={styles.termsParaNumber}>2.17. </Text>&quot;<Text style={styles.termsEmphasis}>User</Text>&quote; and &quot;<Text style={styles.termsEmphasis}>you</Text> means the person making use of the Services; and
            {"\n"}
            <Text style={styles.termsParaNumber}>2.18. </Text>&quot;<Text style={styles.termsEmphasis}>Website</Text>&quote; means means <Text style={styles.termsLink}>www.jupitersave.com</Text>, including all sub-domains.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              3. Application of these terms{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>3.1. </Text>These Terms, and the Privacy Policy, will apply when you use the Services and for the period until any disputes that may arise from your use of the Services have been settled. You are required to accept and agree to these Terms when creating an Account to use the Services.
            {"\n"}
            <Text style={styles.termsParaNumber}>3.2. </Text>We reserve the right to refuse any request for our Services without notice or reason.
            {"\n"}
            <Text style={styles.termsParaNumber}>3.3. </Text>These Terms will also apply to any future services and interaction channels that may be made available by us unless stated otherwise.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              4. Changes to these terms{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>4.1. </Text>We may change or add to these Terms, change or cancel the Services or offer new Services to you from time to time, or change or remove the Platform from time to time, at our discretion. We will notify you of any material changes via email or push message in the App which will contain a link to the updated terms or with a prominent notice on the Platform. To continue using the Services, you may be required to accept new or amended versions of these Terms.
            {"\n"}
            <Text style={styles.termsParaNumber}>4.2. </Text>We will give you 30 (thirty) calendar days&apos; notice of a material change to these Terms. Should you disagree with the changes made, you can stop using our Services.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              5. Our services{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>5.1. </Text>We offer a service, allowing Users to pool their savings in a money market fund and earn a higher interest rate than generally possible without the pooling of funds. Our Services aim to encourage healthy savings habits and rewards Users for various savings behaviours and actions. 
            {"\n"}
            <Text style={styles.termsParaNumber}>5.2. </Text>Through your use of the Services, your Capital Savings will earn Interest at the interest rate displayed on the Platform, and your Jupiter Balance may also be increased where you earn Boosts or Rewards through your use of the Services.
            {"\n"}
            <Text style={styles.termsParaNumber}>5.3. </Text>Further specific details about the Services, including Rewards and Boosts, are available on the Platform.
            {"\n"}
            <Text style={styles.termsParaNumber}>5.4. </Text><Text style={styles.termsEmphasis}>It is entirely your responsibility to seek professional advice on the legal effect of the Services provided by us to you. The provision by Jupiter of the Services does not constitute financial advice and nothing in this document or on the Platform should be construed as constituting financial advice. If you require financial advice, it is your responsibility to appoint an independent financial adviser.</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>5.5. </Text>The Services are only permitted to be used by Users who are 18 (eighteen) years and older at the time of agreeing to these Terms. Jupiter has the right to suspend or cancel an Account and return your Jupiter Balance without prior notice or liability where you are in breach of this clause.

            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              6. Your account and information{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>6.1. </Text>To access the App and the Services as a User, you must create an Account by providing certain Personal Information.
            {"\n"}
            <Text style={styles.termsParaNumber}>6.2. </Text>By creating an Account, you agree that all information provided to Jupiter, including the Personal Information, is your own information and that the information is true, accurate, current and correct and you undertake to update the information as and when required.
            {"\n"}
            <Text style={styles.termsParaNumber}>6.3. </Text>You must keep your Account access details (username and password) confidential and not allow anyone else to use your Account. You also accept full responsibility for all activities that happen through your Account and agree not to share your username and password with anyone, failing which you accept full responsibility for all activities happening through your Account. You are only permitted to register and use one Account – if you use more than one Account, we may cancel all your access to our Services and the Platform.
            {"\n"}
            <Text style={styles.termsParaNumber}>6.4. </Text>You may only use your Account and the Services for your own personal purposes. You are strictly prohibited from sub-licensing or commercially exploiting the Account or the Services. 
            {"\n"}
            <Text style={styles.termsParaNumber}>6.5. </Text>You must inform us immediately if there has been, or if you suspect, any breach of security, confidentiality or of your Account, and update your Account password.
            {"\n"}

            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              7. Cancellation and suspension{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>7.1. </Text>If you are in breach of these Terms, we may, at any time, cancel or suspend your Account or access to the Platform and/or use of the Services in our sole discretion, without prior notice or any liability.
            {"\n"}
            <Text style={styles.termsParaNumber}>7.2. </Text>In addition, Jupiter may cancel your Account, terminate the relationship with you, and suspend our obligations if:
            {"\n"}
            7.2.1. we become aware of circumstances that lead us to believe that you will not perform your obligations required by these Terms; 
            {"\n"}
            7.2.2. you have used the Platform to breach the intellectual property or other rights of Jupiter or any third party;
            {"\n"}
            7.2.3. you have not used your Account or the Services for 3 (three) years and are therefore considered to be an inactive User, during which period we will attempt to contact you; or 
            {"\n"}
            7.2.4. you have suspended any payments due by you in terms of these Terms to us.
            {"\n"}
            <Text style={styles.termsParaNumber}>7.3. </Text>Importantly, all our rights in respect of the confidentiality undertakings and our limitation of liability as set out below will survive the termination of these Terms.
            {"\n"}
            <Text style={styles.termsParaNumber}>7.4. </Text>Upon termination of these Terms:
            {"\n"}
            7.4.1. you must make all reasonable efforts to delete all parts of the Services held by you in any format whatsoever;  
            {"\n"}
            7.4.2. you must immediately cease all use of the Services; 
            {"\n"}
            7.4.3. your Capital Savings will stop earning Interest and you will no longer earn or receive any Boosts or Rewards; 
            {"\n"}
            7.4.4. we will delete your Account and you will no longer be able to access any portion of the Platform or Services that requires an Account;
            {"\n"}            
            7.4.5. we will hold your funds in compliance with applicable laws and will pay out any amounts that are due to you as reflected by your Jupiter Balance as at the date of termination of these Terms into your nominated bank account; and
            {"\n"}
            7.4.6. we will remove your payment information from our systems but may retain your Personal Information generated as a result of the Services for a reasonable period in line with the Privacy Policy.
            {"\n"}
            <Text style={styles.termsParaNumber}>7.5. </Text>Please contact us at <Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text> for any questions on the process of terminating your Account and withdrawing any funds reflected in your Jupiter Balance.
            
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              8. Fees{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>8.1. </Text>In consideration for the Services, Jupiter will retain the Service Fee, being a portion of the Interest earned on the Capital Savings managed by the Asset Manager. The Interest rate displayed on the Platform from time to time is the Interest rate less the Service Fee, and the Service Fee will not be deducted from any Interest you earn.  Further information on the Service Fees is set out on the Website. 
            {"\n"}
            <Text style={styles.termsParaNumber}>8.2. </Text>To use the Services, Users transfer money to Jupiter so that the User has Capital Savings and a positive Jupiter Balance. The Capital Savings can be transferred to Jupiter via (i) an EFT payment or (ii) a card payment.
            {"\n"}
            <Text style={styles.termsParaNumber}>8.3. </Text>EFT Payments: where the transfer of Capital Savings are made with an EFT payment (whether a once-off EFT payment or with a debit order), Users will not incur any costs for the transfer (other than any fees charged by the User's bank), and the full amount paid by the User will be allocated to your Jupiter Balance as Capital Savings. For example, if you transfer R100 to Jupiter, R100 will be added to your Jupiter Balance. Any fees that your bank might charge you will be an expense to your bank account and won&apos;t impact your Jupiter Balance. 
            {"\n"}
            <Text style={styles.termsParaNumber}>8.4. </Text>Card Payments: where the transfer of Capital Savings are made with a card payment (through a third party payment gateway mechanism on the Platform), Users will incur a card payment cost equal to 3% of the rand value of the amount transferred by the User to Jupiter as Capital Savings (&quot;<Text style={styles.termsEmphasis}>Card Payment Fee</Text>&quot;). The Card Payment Fee will be deducted from the amount paid by the User and the balance will be allocated to your Jupiter Balance as Capital Savings. For example, if you transfer R100 to Jupiter, R3 will be deducted as the Card Payment Fee and R97 will be added to your Jupiter Balance. Jupiter will however not charge you for the first 3 (three) card payments that you make, but you will be liable for the Card Payment Fee from the 4th (forth) payment. 
            {"\n"}
            <Text style={styles.termsParaNumber}>8.5. </Text>Jupiter may decide to charge an account fee or a subscription fee for the use of the Platform or Services in the future, and the Service Fee and/or Card Payment Fee is also subject to change from time to time, however, these changes will be notified to you in advance. You will be required to accept an updated version of these Terms if we change any fees that we charge.
            {"\n"}
            <Text style={styles.termsParaNumber}>8.6. </Text>Other fees that may be applicable to your use of the Platform and Services include, but are not limited to:
            {"\n"}
            8.6.1. bank fees charged by your bank;  
            {"\n"}
            8.6.2. data costs charged by your internet service provider; and 
            {"\n"}
            8.6.3. taxes, including any tax on Interest earned. 

            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              9. Payments{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>9.1. </Text><Text style={styles.termsUnderline}>Payments to Jupiter</Text>: Capital Savings payments to Jupiter from your bank account are subject to standard processing times of the banks involved (being our partner bank and your bank). Your Jupiter Balance will only be updated once we receive your payment into our bank account (which may be instant or a few days after you have made the payment depending on the payment method used).
            {"\n"}
            <Text style={styles.termsParaNumber}>9.2. </Text><Text style={styles.termsUnderline}>Withdrawals from your Jupiter Account</Text>: withdrawals from your Jupiter Account into your bank account are subject to standard processing times of the banks involved (being our partner bank and your bank). When you request a withdrawal on the Platform, Jupiter will process your request within 24 (twenty four) hours and your Jupiter Balance will be updated when we make payment from our bank account to you (you may only receive that payment into your bank account a few days later).
            {"\n"}
            <Text style={styles.termsParaNumber}>9.3. </Text>You warrant that you are authorised to make payments to Jupiter as Capital Savings, and we reserve the right to terminate any Service if you are not authorised to make such payments. You must ensure that there are enough funds in your bank account to cover the payments being made to Jupiter and any fees that you may incur when making such payments, and you acknowledge that Jupiter will not be liable for any overdraft fees that you might incur.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.4. </Text><Text style={styles.termsUnderline}>Asset Manager</Text>: Jupiter makes use of the Asset Manager to manage the pooling of Capital Savings into the Asset Manager&apos;s money market fund. 
            {"\n"}
            <Text style={styles.termsParaNumber}>9.5. </Text><Text style={styles.termsUnderline}>Third party payment gateway</Text>: where Users make payments to Jupiter with a card payment, Users will be required to make use of the third party payment gateway mechanism on the Platform (currently provided by Ozow (Pty) Ltd), and by using such payment option, Users agree to adhere to the terms and conditions stipulated by the third party payment gateway and agree to pay the related Card Payment Fees. Any payment information required by the third party payment gateway will be stored by them, and Jupiter will not have access to any card information provided to the payment gateway.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.6. </Text><Text style={styles.termsEmphasis}>Under no circumstances will Jupiter be responsible for any fees incurred by you to the third party payment gateway or any other third parties.</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>9.7. </Text><Text style={styles.termsUnderline}>Transaction records</Text>: we will make all documentation relating to transactions between you and us available to you in your Account.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.8. </Text><Text style={styles.termsUnderline}>Taxes</Text>: all fees exclude any applicable taxes unless stated otherwise. To the extent allowed under applicable laws, the User is responsible for any applicable taxes, whether they are listed on the transaction documents or not.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.9. </Text><Text style={styles.termsUnderline}>Tax Implications</Text>: we recommend that Users obtain independent professional advice regarding any tax implications arising from the receipt, transfer or spend of any Interest, Boosts or Rewards earned or received as a result of the Services. The User is responsible for any tax liabilities arising from or associated with the use of the Services. The User agrees that they will not hold Jupiter or any of its directors, members, employees, service providers or other related parties, including the Asset Manager, liable, and the User hereby indemnifies and holds Jupiter harmless against all damages, claims and fines made against the User or Jupiter, including all legal costs, to the extent to which such damages, claims and fines arise out of or are connected to any taxation relating to the receipt, transfer or spend of any Interest, Boosts or Rewards earned or received as a result of the Service or the charges in respect thereof as a result of the Services.
            {"\n"}
            <Text style={styles.termsParaNumber}>9.10. </Text><Text style={styles.termsUnderline}>Additional charges</Text>: if you cancel a payment by giving instruction to your bank to return your funds, and they do so, you will be liable to us for any penalty which we incur to that bank or other payment processor, including the Card Payment Fee if such fee is charged to us.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              10. Refunds{"\n"}
            </Text>
            Given the nature of the Services, refunds do not apply and there is no cooling off right. If you want to stop using the Services, you can withdraw your Jupiter Balance at any time without penalty (subject to these Terms). 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              11. Referral codes{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>11.1. </Text>We may, at our discretion, make referral codes available to you, allowing you to share your unique referral code with others, and earning a Reward when people sign up as Users of the Services with your referral code. 
            {"\n"}
            <Text style={styles.termsParaNumber}>11.2. </Text>You will receive your unique referral code once your Jupiter Balance reaches R100 (one hundred Rand). 
            {"\n"}
            <Text style={styles.termsParaNumber}>11.3. </Text>Users will earn a Reward (increasing their Jupiter Balance) when a new user (i) registers with Jupiter by creating an Account and becoming a User with the existing User&apos;s referral code and (ii) the new User&apos;s Jupiter Balance reaches R100 (one hundred Rand) within 120 (one hundred and twenty) days of creating their Account – after which the referral Reward expires. 
            {"\n"}
            <Text style={styles.termsParaNumber}>11.4. </Text>Users may not create additional Accounts to take advantage of the referral Reward. Jupiter reserves the right to revoke or cancel any referral Rewards in such cases, in addition to any other rights Jupiter has in these Terms.
            {"\n"}

            <Text style={styles.termsSectionTitle}>
              12. Rewards and boosts{"\n"}
            </Text>
            Further terms on which we offer Rewards and Boosts are available on the Website. The terms available on the Website at the time of awarding the Rewards and Boosts will apply to it. The terms about Rewards and Boosts on the Website may change from time to time, and all changes to those terms are incorporated into these Terms by reference and will apply to the Services. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              13. Changes to the services{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>13.1. </Text>Jupiter will inform Users of any material changes to the Services via email or with a prominent notice on the Platform. We may require you to accept a new version of these Terms in some cases, and your continued use of the Platform after such notice has been displayed will be deemed as your acceptance of the changes. 
            {"\n"}
            <Text style={styles.termsParaNumber}>13.2. </Text>Should any changes to the Services result in a User having less functionality from the Services, the notice will be sent 30 (thirty) calendar days before any such changes take place, unless prior notice is not reasonably possible in the circumstances.
            {"\n"}{"\n"}


            <Text style={styles.termsSectionTitle}>
              14. Acceptable use policy{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>14.1. </Text>Users may specifically not use the Services for the direct benefit of their own clients or for persons other than themselves. The Services are made available for the personal, non-commercial use of the User only.
            {"\n"}
            <Text style={styles.termsParaNumber}>14.2. </Text>Some devices may not support the use of our Platform. It is your responsibility to keep your device(s) updated and/or in a condition for them to support the use of our Platform, including internet access capabilities. 
            {"\n"}
            <Text style={styles.termsParaNumber}>14.3. </Text>You are required to make use of the current version of the App as and when new versions are made available on the relevant app store, and we reserve the right not to support any previous versions of the App without notice or liability. You acknowledge that your use of the Services may be limited if you do not use the current version of the App, and agree that if you do not install the latest version, the App may not work properly, which may increase security risks and errors, and for which we will not be liable under any circumstances.
            {"\n"}
            <Text style={styles.termsParaNumber}>14.4. </Text>The use of our Services may be restricted to certain geographical areas. It is your responsibility to determine whether your location is supported by our Services before incurring any liability to us as we will not be liable for any loss that you may incur because of our Services not being supported in your location. 
            {"\n"}
            <Text style={styles.termsParaNumber}>14.5. </Text>You must respect our Services and our intellectual property in utmost good faith and use it only as we intend it to be used. Any use by you of our Services which violates this undertaking can result in us terminating your use of our Services. We will be the sole judge of what constitutes a violation of your undertaking to use our Services, but these will likely be good grounds:
            {"\n"}
            14.5.1. copying or distributing any of the content on our Platform without our explicit consent to do so;
            {"\n"}
            14.5.2. providing any untrue or incorrect information to us;
            {"\n"}
            14.5.3. changing, modifying, copying, decompiling, circumventing, disabling, tampering with or any part of our Platform, including the security features or reverse engineering our Platform;
            {"\n"}
            14.5.4. infecting our Platform with any software, malware or code that may infect, damage, delay or impede the operation of our Platform or which may intercept, alter or interfere with any data generated by or received through our Platform;
            {"\n"}
            14.5.5. using malicious search technology, including, but not limited to, spiders and crawlers;
            {"\n"}
            14.5.6. deep linking to any pages of our Platform or engaging in any other conduct in a way to suggest that you are the owner of any intellectual property in our Services; 
            {"\n"}
            14.5.7. allowing any third party to use your Account; 
            {"\n"}
            14.5.8. creating multiple Accounts to use the Services; 
            {"\n"}
            14.5.9. using the Services for commercial purposes or for the benefit of anyone other than yourself; or
            {"\n"}
            14.5.10. using the interactive sections of our Platform to post any material which, in our discretion, is false, defamatory, discriminating, inaccurate, abusive, vulgar, hateful, harassing, obscene, profane, sexually oriented, threatening, invasive of a person's privacy, or otherwise violates any laws. 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              15. Electronic messages and communication{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>15.1. </Text>We will primarily use email and electronic notices on the Platform as our communication tool for all communications relating to our Services or these Terms. This may also include the use of SMS (short message services), email, or telephone.
            {"\n"}
            <Text style={styles.termsParaNumber}>15.2. </Text><Text style={styles.termsEmphasis}>Please note that by accepting these Terms and using our Services, you acknowledge that we may use your personal contact information provided by you for communicating with you via electronic messages and communication in terms of the Protection of Personal Information Act, 4 of 2013. This includes us sending you direct marketing communications. You can opt-out from receiving further direct marketing messages at any point in time.</Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              16. Third party sites{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>16.1. </Text>We may provide certain hyperlinks to third party websites or apps only for your convenience, and the inclusion of any hyperlinks or any advertisement of any third party on our Platform does not imply endorsement by us of their websites or apps, their products, business or security practices or any association with its operators. 
            {"\n"}
            <Text style={styles.termsParaNumber}>16.2. </Text>If you access and use any third-party websites, apps, products, services, and/or business, you do that solely at your own risk.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              17. Intellectual property rights{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>17.1. </Text>You acknowledge and agree that all right, title and interest in, and to, any of our intellectual property (including but not limited to any copyright, trademark, design, logo, process, practice, or methodology which forms part of, or is displayed or used on the Services including, without limitation, any graphics, logos, designs text, button icons, images, audio clips, digital downloads, data compilations, page headers and software) is proprietary to us or the respective owner(s)' property and will remain our or the owner&apos;s property at all times.
            {"\n"}
            <Text style={styles.termsParaNumber}>17.2. </Text>You agree that you will not acquire any rights of any nature in respect of that intellectual property by using our Services.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              18. Warranties and representations{"\n"}
            </Text>
            <Text style={styles.termsEmphasis}>Subject to applicable laws:</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>18.1. </Text><Text style={styles.termsEmphasis}>we give no guarantee of any kind concerning the content or quality of our Services and our Services are not to be considered as advice of any kind;</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>18.2. </Text><Text style={styles.termsEmphasis}>we do not give any warranty (express or implied) or make any representation that our Services will operate error free or without interruption or that any errors will be corrected or that the content is complete, accurate, up to date, or fit for a particular purpose; and</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>18.3. </Text><Text style={styles.termsEmphasis}>we make no representations to you, either express or implied, and we will have no liability or responsibility for the proper performance of the Services and/or the information contained on the Platform. <Text style={styles.termsUnderline}>Our Services are used at your own risk.</Text></Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>18.4. </Text><Text style={styles.termsEmphasis}>You warrant to and in favour of us that:
            {"\n"}
            18.4.1. you have the legal capacity to agree to and be bound by these Terms; 
            {"\n"}
            18.4.2. you are 18 (eighteen) years or older; 
            {"\n"}
            18.4.3. you will not create multiple Accounts to use the Services;
            {"\n"}
            18.4.4. any information provided by you on the Platform is your own; and 
            {"\n"}
            18.4.5. these Terms constitute a contract valid and binding on you and enforceable against you. 
            </Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>18.5. </Text><Text style={styles.termsEmphasis}>Each of the warranties given by you will:
            {"\n"}
            18.5.1. be a separate warranty and will in no way be limited or restricted by inference from the terms of any other warranty or by any other words in these Terms;
            {"\n"}
            18.5.2. continue and remain in force irrespective of whether these Terms are active, suspended or cancelled; and
            {"\n"}
            18.5.3. be deemed to be material.
            </Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              19. Limited liabilities{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>19.1. </Text><Text style={styles.termsEmphasis}>To be clear, subject to applicable laws:</Text>
            {"\n"}
            19.1.1. we will not be liable for any loss arising from your use of the Services or any reliance on the information presented on the Platform or in the Services or provided by Jupiter as part of the Services;
            {"\n"}
            19.1.2. we will not be liable to you for any loss caused by using our Services or your liability to any third party arising from those subjects. This includes but is not limited to:
                {"\n"}19.1.2.1. any loss that you may incur as a result of your Capital Savings being pooled in a money market fund by the Asset Manager;
                {"\n"}19.1.2.2. any loss that may result from your use of a third party payment gateway; 
                {"\n"}19.1.2.3. any delays experienced due to the transfer of funds between our bank and your bank; 
                {"\n"}19.1.2.4. any interruption, malfunction, downtime, off-line situation or other failure of the Platform, system, databases or any of its components;
                {"\n"}19.1.2.5. any loss or damage regarding your data or other data directly or indirectly caused by malfunction of the Platform; and
                {"\n"}19.1.2.6. any third-party systems whatsoever, power failures, unlawful access to or theft of data, computer viruses or destructive code on the Platform, or third-party systems or programming defects;
            {"\n"}
            19.1.3. we will not be liable if any material available for downloading from the Platform is not free from infection, viruses and/or other code that has contaminating or destructive properties;
            {"\n"}
            19.1.4. the Platform may include inaccuracies for which we can't be held liable and can't be forced to comply with offers that are genuinely (and/or negligently) erroneous;
            {"\n"}
            19.1.5. we are not responsible for the proper and/or complete transmission of the information contained in any electronic communication or of the electronic communication itself nor for any delay in its delivery or receipt. Security measures have been implemented to ensure the safety and integrity of our Services. However, despite this, information that is transmitted over the internet may be susceptible to unlawful access and monitoring; and
            {"\n"}
            19.1.6. finally, our limited liability applies to all and any kind of loss which we can possibly contract out of under law, including direct, indirect, consequential, special or other kinds of losses or claims which you may suffer.
            {"\n"}
            <Text style={styles.termsParaNumber}>19.2. </Text><Text style={styles.termsEmphasis}>If any matter results in a valid claim against Jupiter, Jupiter's liability will be limited to the fees paid by the User in respect of the Services supplied under these Terms. </Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              20. Indemnity{"\n"}
            </Text>
            <Text style={styles.termsEmphasis}>Subject to applicable laws, you shall indemnify, defend and hold us (including our shareholders, directors and employees), our affiliates, including the Asset Manager, and their employees and suppliers harmless from any and all third party claims, any, actions, suits, proceedings, penalties, judgments, disbursements, fines, costs, expenses, damages (including, without limitation, indirect, extrinsic, special, penal, punitive, exemplary or consequential loss or damage of any kind) and liabilities, including reasonable attorneys' fees, whether directly or indirectly arising out of, relating to, or resulting from negligence, intent, breach of these Terms or violation of applicable law, rule, regulation by a party or its affiliates, or their respective owners, officers, directors, employees, or representatives or any other action or omission of any nature.</Text>
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              21. Force majeure{"\n"}
            </Text>
            Except for the obligation to pay monies due and owing, neither you nor we shall be liable if either of us cannot perform in terms of any agreed terms due to reasons beyond our control. This includes lightning, flooding, exceptionally severe weather, fire, explosion, war, civil disorder, industrial disputes, acts or omissions of persons for which we are not responsible, and acts of government or other competent authorities (including telecommunications and internet service providers). 
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              22. Arbitration{"\n"}
            </Text>
            <Text style={styles.termsParaNumber}>22.1. </Text>Any dispute which arises out of or pursuant to these Terms (other than where an interdict is sought, or urgent relief may be obtained from a court of competent jurisdiction) will be submitted to and decided by arbitration in accordance with the arbitration rules and legislation for the time being in force in the Republic of South Africa.
            {"\n"}
            <Text style={styles.termsParaNumber}>22.2. </Text>The parties shall jointly appoint an arbitrator within 14 (fourteen) calendar days of either party demanding arbitration from the other Party, failing which either party shall be entitled to approach the Secretariat of the Arbitration Foundation of South Africa (&quot;<Text style={styles.termsEmphasis}>AFSA</Text>&quot;) to recommend an arbitrator to preside over the arbitration proceedings, which recommendation will immediately be deemed to have been accepted by the parties as soon as such recommendation is made to either party and the arbitration process may immediately commence.
            {"\n"}
            <Text style={styles.termsParaNumber}>22.3. </Text>Unless otherwise agreed, the rules of Commercial Arbitration as stipulated by AFSA will apply to such arbitration.
            {"\n"}
            <Text style={styles.termsParaNumber}>22.4. </Text>That arbitration shall be held:
            {"\n"}22.4.1. with only the parties and their representatives present;
            {"\n"}22.4.2. in Gauteng. 
            {"\n"}
            <Text style={styles.termsParaNumber}>22.5. </Text>The provisions of this clause 22 are severable from the rest of these Terms and shall remain in effect even if these Terms are terminated for any reason.
            {"\n"}
            <Text style={styles.termsParaNumber}>22.6. </Text>The arbitrator&apos;s award shall be final and binding on the Parties and incapable of appeal.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              23. Legal disclosure{"\n"}
            </Text>

            <Text style={styles.termsParaNumber}>23.1. Platform provider: </Text>Jupiter Savings SA (Pty) Ltd (trading as &quot;Jupiter&quot;), company registration number 2019/174659/07. 
            {"\n"}
            <Text style={styles.termsParaNumber}>23.2. Legal status: </Text>Jupiter is a private company, duly incorporated in terms of the applicable laws of the Republic of South Africa.
            {"\n"}
            <Text style={styles.termsParaNumber}>23.3. Directors: </Text>LS Jordan and A Brijmohun.
            {"\n"}
            <Text style={styles.termsParaNumber}>23.4. Description of main business of Jupiter: </Text>Jupiter is a fintech business which aims to create and grow the savings pools of South Africans of all income levels by giving them access to savings options at low minimum entry requirements. In addition, Jupiter aims to encourage users to save higher amounts through the use of machine learning to drive incentives, boosts, rewards and games to our client bases.
            {"\n"}
            <Text style={styles.termsParaNumber}>23.5. Email address: </Text><Text style={styles.termsLink}>ineedhelp@jupitersave.com</Text>
            {"\n"}
            <Text style={styles.termsParaNumber}>23.6. Website address: </Text><Text style={styles.termsLink}>www.jupitersave.com</Text> 
            {"\n"}
            <Text style={styles.termsParaNumber}>23.7. Registered address: </Text>Unit 0208 Civic Towers, corner of Stiemens and Biccard Street, Braamfontein, Gauteng, South Africa, 2001.
            {"\n"}
            <Text style={styles.termsParaNumber}>23.8. Physical and postal address: </Text>The Link Tower, 173 Oxford Road, Rosebank, Gauteng, 2196.
            {"\n"}{"\n"}

            <Text style={styles.termsSectionTitle}>
              24. General{"\n"}
            </Text>

            <Text style={styles.termsParaNumber}>24.1. </Text><Text style={styles.termsEmphasis}>Suspension of the Platform:</Text> we may temporarily suspend the Platform for any reason, including repairs or upgrades to the Platform or other systems. Jupiter will take reasonable efforts to notify Users of such suspensions in advance.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.2. </Text><Text style={styles.termsEmphasis}>Entire agreement:</Text> these Terms constitute the whole agreement between the parties relating to the subject matter of these Terms and supersedes any other discussions, agreements and/or understandings regarding the subject matter of these Terms.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.3. </Text><Text style={styles.termsEmphasis}>Confidentiality:</Text> neither party shall disclose any confidential information to any third party without the prior written approval of the other party, unless required by law or in terms of these Terms. 
            {"\n"}
            <Text style={styles.termsParaNumber}>24.4. </Text><Text style={styles.termsEmphasis}>Law and jurisdiction:</Text> these Terms and all obligations connected to them or arising from them shall be governed and interpreted in terms of the laws of the Republic of South Africa. Each party submits to the jurisdiction of the South African courts.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.5. </Text><Text style={styles.termsEmphasis}>Good faith:</Text> the parties shall in their dealings with each other display good faith.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.6. </Text><Text style={styles.termsEmphasis}>Breach:</Text> if either party to these Terms breaches any material provision or term of these Terms and fails to remedy such breach within 14 (fourteen) calendar days of receipt of written notice requiring it to do so then the aggrieved party shall be entitled without notice, in addition to any other remedy available to it at law or under these Terms (including obtaining an interdict), to cancel these Terms or to claim specific performance of any obligation whether or not the due date for performance has arrived, in either event without prejudice to the aggrieved party&apos;s right to claim damages.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.7. </Text><Text style={styles.termsEmphasis}>No waiver:</Text> the failure of Jupiter to insist upon or enforce strict performance by the User of any provision of these Terms, or to exercise any right under these Terms, shall not be construed as a waiver or relinquishment of Jupiter's right to enforce any such provision or right in any other instance.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.8. </Text><Text style={styles.termsEmphasis}>No assignment:</Text> the User will not be entitled to cede its rights or delegate its obligations in terms of these Terms without the express prior written consent of Jupiter.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.9. </Text><Text style={styles.termsEmphasis}>Relationship between the parties:</Text> the parties agree that neither party is a partner or agent of the other party and neither party will have any right, power, or authority to enter into any agreement for, or on behalf of, or incur any obligation or liability of, or to otherwise bind, the other party.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.10. </Text><Text style={styles.termsEmphasis}>No representation:</Text> to the extent permissible by law, no party shall be bound by any express or implied or tacit term, representation, warranty, promise or the like not recorded herein, whether it induced the contract and/or whether it was negligent or not.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.11. </Text><Text style={styles.termsEmphasis}>Severability:</Text> any provision in these Terms which is or may become illegal, invalid or unenforceable shall be ineffective to the extent of such prohibition or unenforceability and shall be severed from the balance of these Terms, without invalidating the remaining provisions of these Terms.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.12. </Text><Text style={styles.termsEmphasis}>No stipulation:</Text> no part of these Terms shall constitute a stipulation in favour of any person who is not a party to these Terms unless the provision in question expressly provides that it does constitute such a stipulation.
            {"\n"}
            <Text style={styles.termsParaNumber}>24.13. </Text><Text style={styles.termsEmphasis}>Notices:</Text> 
            {"\n"}24.13.1. Jupiter selects the Link Tower, 173 Oxford Road, Rosebank, Gauteng, 2196 as its physical address and ineedhelp@jupitersave.com as its email address for the service of all formal notices and legal processes in connection with these Terms, which may be updated from time to time by updating these Terms. 
            {"\n"}24.13.2. You hereby select the email address specified in your Account as your address for service of all formal notices and legal processes in connection with these Terms, which may be changed by providing Jupiter with 7 (seven) calendar days&apos; notice in writing. 
            {"\n"}24.13.3. Service via email shall be accepted in all cases where notice is required unless alternative service is required by law. Service via email is deemed to be received at the time and day of sending.
            {"\n"}

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
    fontSize: 16,
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
    fontFamily: 'poppins-semibold',
  },
  termsLink: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  termsParaNumber: {
    fontFamily: 'poppins-semibold'
  },
  termsEmphasis: {
    fontFamily: 'poppins-semibold'
  },
  termsUnderline: {
    textDecorationLine: 'underline'
  }
});
