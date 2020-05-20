import React from 'react';

import { StyleSheet, View, Image, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Colors } from '../../util/Values';

const { width } = Dimensions.get('window');

const IMAGE_WIDTH = 320;
const GRID_SIDE_LENGTH = 4;
const SIDE_PADDING = Math.max(0, (width - IMAGE_WIDTH) / 2);

export default class BreakingGameGrid extends React.PureComponent {
  constructor(props) {
    super(props);

    const tapCounter = Array(GRID_SIDE_LENGTH).fill(Array(GRID_SIDE_LENGTH).fill(0));
    const opacityGrid = Array(GRID_SIDE_LENGTH).fill([...Array(GRID_SIDE_LENGTH).fill(1)]);

    this.state = {
      tapsPerSquare: 5,
      tapCounter,
      opacityGrid,
    }
  }

  async componentDidMount() {
    const { gameParams } = this.props;
    if (!gameParams) {
      return;
    }

    this.setState({
      tapsPerSquare: gameParams.tapsPerSquare || 5,
    });
  }

  // we want to change the reference to force a rerender which adjusts the opacity, but only necessary for one of them
  onPressElement = (rowNumber, columnNumber) => {
    console.log('PRESSED');
    const { tapCounter: oldTapCounter, opacityGrid: oldOpacity } = this.state;
    const newRow = [...oldTapCounter[rowNumber]];
    
    const numberTaps = oldTapCounter[rowNumber][columnNumber] + 1;
    if (numberTaps > this.state.tapsPerSquare) {
      return;
    }

    newRow[columnNumber] = numberTaps;
    const tapCounter = [...oldTapCounter];
    tapCounter[rowNumber] = newRow;

    // console.log('Opacity grid: ', JSON.stringify(opacityGrid));
    
    // console.log('Number taps: ', numberTaps, ' and taps per square: ', this.state.tapsPerSquare);
    const newItemOpacity = 1 - numberTaps / this.state.tapsPerSquare;
    console.log(`New opacity: ${newItemOpacity} for row ${rowNumber} and column ${columnNumber}`);
    const newOpacityRow = [...oldOpacity[rowNumber]];
    newOpacityRow[columnNumber] = newItemOpacity;
    const opacityGrid = [...oldOpacity];
    opacityGrid[rowNumber] = newOpacityRow;
    console.log('Huh ? New opacity grid: ', opacityGrid);

    this.setState({ tapCounter, opacityGrid });
  }

  calculateOpacity = (rowNumber, columnNumber) => {
    const numberTaps = this.state[rowNumber][columnNumber];
    const proportionDestroyed = numberTaps / this.state.tapsPerSquare;
    return 1 - proportionDestroyed;
  }

  calculatePercentDestroyed() {
    const { tapCounter } = this.state;
    const summedRows = tapCounter.map((row) => row.reduce((sum, columnValue) => sum + columnValue, 0));
    const summedTaps = summedRows.reduce((sum, summedRow) => sum + summedRow, 0);
    return summedTaps / (this.state.tapsPerSquare * GRID_SIDE_LENGTH * GRID_SIDE_LENGTH);
  }

  // https://stackoverflow.com/questions/47362222/how-to-show-the-only-part-of-the-image
  renderGridElement(rowNumber, columnNumber) {
    const GRID_ITEM_SQUARE_LENGTH = 80;

    const OFFSET_TOP = rowNumber * GRID_ITEM_SQUARE_LENGTH;
    const OFFSET_LEFT = columnNumber * GRID_ITEM_SQUARE_LENGTH;

    return (
      <TouchableWithoutFeedback 
        onPress={() => this.onPressElement(rowNumber, columnNumber)}
      >
        <View
          onPress={() => this.onPressElement(rowNumber, columnNumber)}
          style={{
            maxHeight: GRID_ITEM_SQUARE_LENGTH,
            maxWidth: GRID_ITEM_SQUARE_LENGTH,
            overflow: 'hidden',
            position: 'absolute',
            top: OFFSET_TOP,
            left: OFFSET_LEFT,
            borderColor: Colors.LIGHT_GRAY,
            borderWidth: 1,
          }}
        >
          <Image
            source={require("../../../assets/credit-card.png")}
            style={{
              overflow: 'hidden',
              marginTop: -OFFSET_TOP,
              marginLeft: -OFFSET_LEFT,
              opacity: this.state.opacityGrid[rowNumber][columnNumber],
            }}  
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderGridRow(rowNumber) {
    return (
      <View key={`row-${rowNumber}`} style={styles.gridRow}>
        {Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridElement(rowNumber, index))}
      </View>
    )
  }

  renderGrid() {
    return Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridRow(index));
  }

  render() {
    return (
      <View style={styles.imageHolder}>
        {this.renderGrid()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageHolder: {
    paddingHorizontal: SIDE_PADDING,
  },
  gridRow: {
    flexDirection: 'row',
  },
});
