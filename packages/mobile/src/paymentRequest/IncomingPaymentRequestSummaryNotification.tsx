import * as React from 'react'
import { WithTranslation } from 'react-i18next'
import { Image, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { PaymentRequest } from 'src/account/types'
import CeloAnalytics from 'src/analytics/CeloAnalytics'
import { CustomEventNames } from 'src/analytics/constants'
import { declinePaymentRequest } from 'src/firebase/actions'
import { Namespaces, withTranslation } from 'src/i18n'
import { fetchPhoneAddressesAndCheckIfRecipientValidationRequired } from 'src/identity/actions'
import {
  addressToE164NumberSelector,
  AddressToE164NumberType,
  e164NumberToAddressSelector,
  E164NumberToAddressType,
} from 'src/identity/reducer'
import { sendDollar } from 'src/images/Images'
import { navigate } from 'src/navigator/NavigationService'
import { Stacks } from 'src/navigator/Screens'
import SummaryNotification from 'src/notifications/SummaryNotification'
import { listItemRenderer } from 'src/paymentRequest/IncomingPaymentRequestListScreen'
import PaymentRequestNotificationInner from 'src/paymentRequest/PaymentRequestNotificationInner'
import { getSenderFromPaymentRequest } from 'src/paymentRequest/utils'
import { NumberToRecipient } from 'src/recipients/recipient'
import { recipientCacheSelector } from 'src/recipients/reducer'
import { RootState } from 'src/redux/reducers'

interface OwnProps {
  requests: PaymentRequest[]
}

interface DispatchProps {
  declinePaymentRequest: typeof declinePaymentRequest
  fetchPhoneAddressesAndCheckIfRecipientValidationRequired: typeof fetchPhoneAddressesAndCheckIfRecipientValidationRequired
}

type Props = OwnProps & DispatchProps & WithTranslation & StateProps

interface StateProps {
  e164PhoneNumberAddressMapping: E164NumberToAddressType
  addressToE164Number: AddressToE164NumberType
  recipientCache: NumberToRecipient
  manualAddressValidationRequired: boolean
  fullValidationRequired: boolean
}

const mapStateToProps = (state: RootState): StateProps => {
  const { manualAddressValidationRequired, fullValidationRequired } = state.send
  return {
    e164PhoneNumberAddressMapping: e164NumberToAddressSelector(state),
    addressToE164Number: addressToE164NumberSelector(state),
    recipientCache: recipientCacheSelector(state),
    manualAddressValidationRequired,
    fullValidationRequired,
  }
}

const mapDispatchToProps = {
  declinePaymentRequest,
  fetchPhoneAddressesAndCheckIfRecipientValidationRequired,
}

// Payment Request notification for the notification center on home screen
export class IncomingPaymentRequestSummaryNotification extends React.Component<Props> {
  onReview = () => {
    CeloAnalytics.track(CustomEventNames.incoming_request_payment_review)
    navigate(Stacks.IncomingRequestStack)
  }

  itemRenderer = (item: PaymentRequest) => {
    return (
      <PaymentRequestNotificationInner
        key={item.uid}
        amount={item.amount}
        requesterRecipient={getSenderFromPaymentRequest(
          item,
          this.props.addressToE164Number,
          this.props.recipientCache
        )}
      />
    )
  }

  render() {
    const {
      recipientCache,
      requests,
      t,
      manualAddressValidationRequired,
      fullValidationRequired,
    } = this.props

    return requests.length === 1 ? (
      listItemRenderer({
        // accessing via this.props.<...> to avoid shadowing
        declinePaymentRequest: this.props.declinePaymentRequest,
        recipientCache,
        fetchPhoneAddressesAndCheckIfRecipientValidationRequired: this.props
          .fetchPhoneAddressesAndCheckIfRecipientValidationRequired,
        manualAddressValidationRequired,
        fullValidationRequired,
      })(requests[0])
    ) : (
      <SummaryNotification<PaymentRequest>
        items={requests}
        title={t('incomingPaymentRequests')}
        icon={<Image source={sendDollar} style={styles.image} resizeMode="contain" />}
        onReview={this.onReview}
        itemRenderer={this.itemRenderer}
      />
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
  },
})

export default connect<StateProps, DispatchProps, {}, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation(Namespaces.walletFlow5)(IncomingPaymentRequestSummaryNotification))
