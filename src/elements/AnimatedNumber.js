import React from 'react';
import { Text } from 'react-native';
import moment from 'moment';

export default class AnimatedNumber extends React.Component {

  constructor(props) {
    super(props);
    let isIncrement = this.props.target > this.props.initial;
    let interval = 14;
    let duration = 5;
    let diff = isIncrement ? this.props.target - this.props.initial : this.props.initial - this.props.target;
    let steps = diff / this.props.stepSize;
    if (this.props.duration) {
      interval = this.props.duration / steps;
    } else if (this.props.interval) {
      duration = this.props.interval * steps;
    }
    this.state = {
      initialNumber: this.props.initial,
      currentNumber: this.props.initial,
      targetNumber: this.props.target,
      stepSize: this.props.stepSize,
      duration: this.props.duration ? this.props.duration : duration,
      interval: this.props.interval ? this.props.interval : interval,
      isIncrement: isIncrement,
    };
  }

  async componentDidMount() {
    this.animate();
  }

  animate() {
    if (this.state.currentNumber == this.state.targetNumber) {
      if (this.props.onAnimationFinished) {
        this.props.onAnimationFinished();
      }
      return;
    }
    let startTime = moment();
    let nextNumber = this.state.currentNumber + this.state.stepSize * (this.state.isIncrement ? 1 : -1);
    if (this.state.isIncrement && nextNumber > this.state.targetNumber) nextNumber = this.state.targetNumber;
    if (!this.state.isIncrement && nextNumber < this.state.targetNumber) nextNumber = this.state.targetNumber;
    this.setState({
      currentNumber: nextNumber,
    }, () => {
      if ((this.state.isIncrement && nextNumber < this.state.targetNumber) || (!this.state.isIncrement && nextNumber > this.state.targetNumber)) {
        let timeout = this.state.interval - (moment().valueOf() - startTime.valueOf());
        if (timeout < 0) timeout = 0;
        setTimeout(() => {this.animate()}, timeout);
        if (this.props.onAnimationProgress) {
          this.props.onAnimationProgress(nextNumber);
        }
      } else {
        if (this.props.onAnimationFinished) {
          this.props.onAnimationFinished();
        }
      }
    });
  }

  render() {
    let value = this.state.currentNumber;
    if (this.props.formatting) {
      value = this.props.formatting(value);
    }
    return (
      <Text style={this.props.style}>{value}</Text>
    );
  }
}
