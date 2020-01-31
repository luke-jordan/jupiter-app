import React from 'react';
import { Text } from 'react-native';
import moment from 'moment';

const DEFAULT_INTERVAL_MSECS = 15;
const CORE_PROPS = ['initial', 'target', 'stepSize', 'interval', 'duration']; // need 2 out of 3 to determine third

export default class AnimatedNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentNumber: 0,
      targetNumber: 0,
      interval: DEFAULT_INTERVAL_MSECS,
      isUnmounted: true,
    };
  }

  async componentDidMount() {
    console.log('*** ANIMATED NUMBER RESTART ****');
    this.setCoreParamsAndAnimate();
    this.setState({ isUnmounted: false });
  }

  componentDidUpdate(prevProps) {
    // if initial or target changes, we recalibrate; note means setting 'initial' back to zero is not going to work, may need future override
    const corePropChanged = CORE_PROPS.find(
      key => this.props[key] !== prevProps[key]
    );
    if (corePropChanged) {
      // console.log(`Animated number core prop changed: ${corePropChanged}, initial: ${prevProps[corePropChanged]}, new: ${this.props[corePropChanged]}`);
      this.setCoreParamsAndAnimate();
    }
  }

  // this is not a great pattern but the alternative is too convert the set timeout into a timed observable and unsubscribe from it
  // here, but that would be far more work than is justified at this stage by this quasi-anti-pattern
  async componentWillUnmount() {
    this.setState({ isUnmounted: true });
  }

  // basically two ways to set this, either pass in duration & interval and we figure out step size; or pass in stepsize and duration and
  // we figure out the interval, that's it
  setCoreParamsAndAnimate() {
    const diff = Math.abs(this.props.target - this.props.initial);
    let steps;
    let stepSize;
    let interval = 0;
    if (this.props.interval) {
      steps = this.props.duration / this.props.interval;
      stepSize = diff / steps;
      interval = this.props.interval;
    } else {
      steps = diff / this.props.stepSize;
      stepSize = this.props.stepSize;
      interval = this.props.duration
        ? this.props.duration / steps
        : DEFAULT_INTERVAL_MSECS;
    }
    console.log(
      `To cover difference of ${diff}, with step size, ${stepSize}, need ${steps} steps`
    );
    this.setState(
      {
        currentNumber: this.props.initial,
        targetNumber: this.props.target,
        interval,
        stepSize,
        isIncrement: this.props.target > this.props.initial,
      },
      () => {
        // console.log(`Animated number paramaters set with interval ${this.state.interval} and duration ${this.props.duration} and step size ${this.state.stepSize}`);
        console.log(
          `Animating from current number ${this.state.currentNumber}, towards target number ${this.state.targetNumber}`
        );
        this.animate();
      }
    );
  }

  animate() {
    if (this.state.currentNumber === this.state.targetNumber) {
      if (this.props.onAnimationFinished) {
        this.props.onAnimationFinished();
      }
      return;
    }
    const startTime = moment();
    const candidateNextNumber =
      this.state.currentNumber +
      this.state.stepSize * (this.state.isIncrement ? 1 : -1);

    const isAboveOrBelowTarget = this.state.isIncrement
      ? candidateNextNumber > this.state.targetNumber
      : this.state.targetNumber > candidateNextNumber;

    const nextNumber = isAboveOrBelowTarget
      ? this.state.targetNumber
      : candidateNextNumber;

    if (this.state.isUnmounted) {
      return;
    }
    this.setState(
      {
        currentNumber: nextNumber,
      },
      () => {
        if (this.props.onAnimationProgress) {
          this.props.onAnimationProgress(nextNumber);
        }
        setTimeout(() => {
          this.animate();
        }, Math.max(0, this.state.interval - (moment().valueOf() - startTime.valueOf())));
      }
    );
  }

  render() {
    return (
      <Text style={this.props.style}>
        {this.props.formatting
          ? this.props.formatting(this.state.currentNumber)
          : this.state.currentNumber}
      </Text>
    );
  }
}
