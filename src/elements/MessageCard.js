import React from 'react';

import { View, Image, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

import * as Animatable from 'react-native-animatable';

import { Colors, Sizes } from '../util/Values';

const { width } = Dimensions.get('window');
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

          case 'VIEW_BOOSTS':
            return 'VIEW BOOSTS'
    
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
      const messageBody = messageDetails.body.replace(/\n\s*\n/g, '\n');

      return (
        <FlingGestureHandler
          // eslint-disable-next-line no-bitwise
          direction={Directions.DOWN}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              onFlingMessage(nativeEvent);
            }
          }}
        >
          <Animatable.View animation="fadeInUp" style={styles.messageCard}>
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
            <ScrollView>
              <Text style={styles.messageCardText}>{messageBody}</Text>
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
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </Animatable.View>
        </FlingGestureHandler>
      );
};

const styles = StyleSheet.create({
    messageCard: {
        height: '30%',
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
        paddingRight: 25,
    },
    messageCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        width: '80%',
    },
    messageCardIcon: {
        marginRight: 10,
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
        flexWrap: 'wrap',
    },
    messageCardTitle: {
        fontFamily: 'poppins-semibold',
        fontSize: 3.7 * FONT_UNIT,
        flexWrap: 'wrap',
    },
    messageCardText: {
        fontFamily: 'poppins-regular',
        fontSize: 3.2 * FONT_UNIT,
        paddingHorizontal: 15,
        // paddingTop: 5,
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
        marginRight: 15,
        padding: 10,
        paddingBottom: 6,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: Colors.PURPLE,
        borderRadius: 4,
    },
});

export default MessageCard;
