import React from 'react';

import { View, Image, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

import { Colors, Sizes } from '../util/Values';

const { height, width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const MessageCard = ({
    onFlingMessage,
    messageDetails,
    onPressActionButton,
}) => {

    const getMessageCardButtonText = (action) => {
        switch (action) {
          case 'ADD_CASH':
            return 'ADD CASH';
    
          case 'VIEW_HISTORY':
            return 'VIEW HISTORY';
    
          case 'VISIT_WEB':
            return 'VISIT SITE';
    
          default:
            return '';
        }
      }
    
      const getMessageCardIcon = (iconType) => {
        switch (iconType) {
          case 'BOOST_ROCKET':
            return require('../../assets/rocket.png');
    
          case 'UNLOCKED':
            return require('../../assets/unlocked.png');
    
          default:
            return require('../../assets/notification.png');
        }
      }

      if (!messageDetails) {
        return null;
      }

      const isEmphasis = messageDetails.display.titleType && messageDetails.display.titleType.includes('EMPHASIS');
      const messageActionText = getMessageCardButtonText(messageDetails.actionToTake);

      return (
        <FlingGestureHandler
          direction={Directions.RIGHT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              onFlingMessage(nativeEvent);
            }
          }}
        >
          <View style={styles.messageCard}>
            <View
              style={
                isEmphasis
                  ? styles.messageCardHeaderEmphasis
                  : styles.messageCardHeader
              }
            >
              {!isEmphasis ? (
                <Image
                  style={styles.messageCardIcon}
                  source={getMessageCardIcon(
                    messageDetails.display.iconType
                  )}
                />
              ) : null}
              <Text
                style={
                  isEmphasis
                    ? styles.messageCardTitleEmphasis
                    : styles.messageCardTitle
                }
              >
                {messageDetails.title}
              </Text>
              {isEmphasis ? (
                <Image
                  style={styles.messageCardIconEmphasis}
                  source={getMessageCardIcon(
                    messageDetails.display.iconType
                  )}
                />
              ) : null}
            </View>
            <Text style={styles.messageCardText}>{messageDetails.body}</Text>
            {messageActionText && messageActionText.length > 0 ? (
              <TouchableOpacity
                style={styles.messageCardButton}
                onPress={() =>
                  onPressActionButton(messageDetails.actionToTake)
                }
              >
                <Text style={styles.messageCardButtonText}>
                  {messageActionText}
                </Text>
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={30}
                  color={Colors.PURPLE}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </FlingGestureHandler>
      );
};

const styles = StyleSheet.create({
    messageCard: {
        minHeight: height * 0.23,
        width: '95%',
        backgroundColor: Colors.WHITE,
        marginBottom: -(
        Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT
        ),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    messageCardHeaderEmphasis: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        backgroundColor: Colors.LIGHT_BLUE,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    messageCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 15,
    },
    messageCardIcon: {
        marginHorizontal: 10,
    },
    messageCardIconEmphasis: {
        marginHorizontal: 10,
        position: 'absolute',
        top: -10,
        right: -10,
    },
    messageCardTitleEmphasis: {
        fontFamily: 'poppins-semibold',
        fontSize: 3.7 * FONT_UNIT,
        color: Colors.WHITE,
        paddingVertical: 10,
        marginLeft: 10,
    },
    messageCardTitle: {
        fontFamily: 'poppins-semibold',
        fontSize: 3.7 * FONT_UNIT,
    },
    messageCardText: {
        fontFamily: 'poppins-regular',
        fontSize: 3.2 * FONT_UNIT,
        paddingHorizontal: 15,
        paddingTop: 5,
    },
    messageCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10,
    },
    messageCardButtonText: {
        fontFamily: 'poppins-semibold',
        fontSize: 3.7 * FONT_UNIT,
        color: Colors.PURPLE,
        marginRight: -5,
        padding: 10,
        paddingBottom: 6,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: Colors.PURPLE,
        borderRadius: 4,
    },
});

export default MessageCard;
