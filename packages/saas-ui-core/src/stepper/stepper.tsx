import * as React from 'react'

import {
  chakra,
  forwardRef,
  useMultiStyleConfig,
  HTMLChakraProps,
  ThemingProps,
  omitThemingProps,
  SystemStyleObject,
  createStylesContext,
  Icon,
} from '@chakra-ui/react'

import { CheckIcon } from '../icons'

import { Collapse } from '../collapse'

import { getChildOfType, getChildrenOfType } from '@saas-ui/react-utils'
import { cx, dataAttr } from '@chakra-ui/utils'

import {
  StepperProvider,
  useStepper,
  useStep,
  useStepperContext,
  UseStepperProps,
} from './use-stepper'

const [StylesProvider, useStyles] = createStylesContext('SuiStepper')

export interface StepperProps
  extends UseStepperProps,
    Omit<HTMLChakraProps<'div'>, 'onChange'>,
    ThemingProps<'SuiStepper'> {
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Display progress in multi-step workflows.
 *
 * Can be controlled or uncontrolled.
 */
export const Stepper = forwardRef<StepperProps, 'div'>((props, ref) => {
  const { orientation, children, ...containerProps } = props
  return (
    <StepperContainer ref={ref} orientation={orientation} {...containerProps}>
      <StepperSteps orientation={orientation}>{children}</StepperSteps>
    </StepperContainer>
  )
})

Stepper.displayName = 'Stepper'

export const StepperContainer = forwardRef<StepperProps, 'div'>(
  (props, ref) => {
    const {
      children,
      orientation = 'horizontal',
      step,
      onChange,
      ...rest
    } = props

    const styles = useMultiStyleConfig('SuiStepper', {
      ...rest,
      orientation,
    })
    const containerProps = omitThemingProps(rest)

    const context = useStepper(props)

    const containerStyles: SystemStyleObject = {
      display: 'flex',
      flexDirection: 'column',
      ...styles.container,
    }

    return (
      <StylesProvider value={styles}>
        <StepperProvider value={context}>
          <chakra.div
            ref={ref}
            __css={containerStyles}
            {...containerProps}
            className={cx('sui-stepper', props.className)}
          >
            {children}
          </chakra.div>
        </StepperProvider>
      </StylesProvider>
    )
  }
)

StepperContainer.displayName = 'StepperContainer'

export interface StepperStepsProps extends HTMLChakraProps<'div'> {
  orientation?: 'horizontal' | 'vertical'
  stepComponent?: React.JSXElementConstructor<any>
}

/**
 * Wrapper element containing the steps.
 */
export const StepperSteps: React.FC<StepperStepsProps> = (props) => {
  const { children, orientation = 'horizontal', stepComponent, ...rest } = props
  const styles = useStyles()

  const { activeIndex } = useStepperContext()

  const stepperStyles: SystemStyleObject = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...styles.steps,
  }

  const isVertical = orientation === 'vertical'

  const Step = stepComponent || StepperStep

  const steps = getChildrenOfType(children, Step)

  const elements = steps.reduce<React.ReactElement[]>((memo, step, i, arr) => {
    memo.push(
      <Step
        key={i}
        {...step.props}
        icon={step.props.icon || i + 1}
        isActive={activeIndex === i}
        isCompleted={step.props.isCompleted || activeIndex > i}
      />
    )

    if (isVertical) {
      memo.push(
        <StepperContent key={`content-${i}`} isOpen={activeIndex === i}>
          {step.props.children}
        </StepperContent>
      )
    }

    if (i < arr.length - 1) {
      memo.push(
        <StepperSeparator key={`separator-${i}`} isActive={i < activeIndex} />
      )
    }

    return memo
  }, [])

  const completed = getChildOfType(children, StepperCompleted)

  const content =
    activeIndex >= steps.length ? (
      completed
    ) : !isVertical ? (
      <StepperContent>{steps[activeIndex]?.props?.children}</StepperContent>
    ) : null

  return (
    <>
      <chakra.div
        __css={stepperStyles}
        {...rest}
        className={cx('sui-stepper__steps', props.className)}
      >
        {elements}
      </chakra.div>
      {content}
    </>
  )
}

StepperSteps.displayName = 'StepperSteps'

export interface StepperContentProps extends HTMLChakraProps<'div'> {
  /**
   * Show or hide the content
   */
  isOpen?: boolean
}

/**
 * Renders the step content, is collapsible.
 */
export const StepperContent: React.FC<StepperContentProps> = (props) => {
  const { children, isOpen = true, ...rest } = props
  const styles = useStyles()

  return (
    <chakra.div
      __css={styles.content}
      {...rest}
      className={cx('sui-stepper__content', props.className)}
    >
      <Collapse in={isOpen}>{children}</Collapse>
    </chakra.div>
  )
}

StepperContent.displayName = 'StepperContent'

export interface StepperIconProps extends HTMLChakraProps<'div'> {
  icon: React.ReactNode
  isActive?: boolean
  isCompleted?: boolean
}

/**
 * Displays the current step or a completed icon.
 */
export const StepperIcon: React.FC<StepperIconProps> = (props) => {
  const { icon, isActive, isCompleted, className, ...rest } = props

  const styles = useStyles()

  const iconStyles: SystemStyleObject = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    fontSize: '1em',
    ...styles.icon,
  }

  let content
  if (isCompleted) {
    content = <Icon as={CheckIcon} />
  } else {
    content = icon
  }

  return (
    <chakra.div
      __css={iconStyles}
      {...rest}
      className={cx('sui-stepper__icon', className)}
    >
      {content}
    </chakra.div>
  )
}

StepperIcon.displayName = 'StepperIcon'

export interface StepperStepProps
  extends Omit<HTMLChakraProps<'div'>, 'title'> {
  /**
   * The step title
   */
  title: React.ReactNode
  /**
   * The step name, used for controlled steppers
   */
  name?: string
  /**
   * Show an icon instead of the step number
   */
  icon?: React.ReactNode
  /**
   *
   */
  isActive?: boolean
  /**
   *
   */
  isCompleted?: boolean
}

/**
 * Displays the icon and step title.
 */
export const StepperStep: React.FC<StepperStepProps> = (props) => {
  const { name, title, icon, isActive, isCompleted, ...rest } = props
  const step = useStep(props)
  const styles = useStyles()

  const stepStyles: SystemStyleObject = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    ...styles.step,
  }

  return (
    <chakra.div
      {...rest}
      __css={stepStyles}
      data-active={dataAttr(step.isActive)}
      data-completed={dataAttr(step.isCompleted)}
      className={cx('sui-stepper__step', props.className)}
    >
      <StepperIcon icon={icon} isActive={isActive} isCompleted={isCompleted} />
      {title && <StepperStepTitle>{title}</StepperStepTitle>}
    </chakra.div>
  )
}

StepperStep.displayName = 'StepperStep'

export interface StepperSeparatorProps extends HTMLChakraProps<'div'> {
  isActive?: boolean
}

/**
 * The separator between steps.
 */
export const StepperSeparator: React.FC<StepperSeparatorProps> = (props) => {
  const { isActive, ...rest } = props
  const styles = useStyles()

  const separatorStyles: SystemStyleObject = {
    flex: 1,
    mx: 2,
    ...styles.separator,
  }

  return (
    <chakra.div
      {...rest}
      data-active={dataAttr(isActive)}
      className={cx('sui-stepper__separator', props.className)}
      __css={separatorStyles}
    />
  )
}

StepperSeparator.displayName = 'StepperSeparator'

/**
 * The step title.
 */
export const StepperStepTitle: React.FC<HTMLChakraProps<'p'>> = (props) => {
  const styles = useStyles()
  return (
    <chakra.p
      {...props}
      __css={styles.title}
      className={cx('sui-stepper__title', props.className)}
    />
  )
}

StepperStepTitle.displayName = 'StepperStepTitle'

/**
 * Shown when all steps have completed.
 */
export const StepperCompleted: React.FC<HTMLChakraProps<'div'>> = (props) => {
  const styles = useStyles()
  return (
    <chakra.div
      __css={styles.completed}
      {...props}
      className={cx('sui-stepper__completed', props.className)}
    />
  )
}

StepperCompleted.displayName = 'StepperCompleted'
