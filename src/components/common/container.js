import React from 'react'
import classnames from 'classnames'
import containerStyles from './container.module.scss'

const Container = ({ children, narrow, centered, className }) => {
  return (
    <div
      className={classnames('container', containerStyles.container, className)}
    >
      <div
        className={classnames(
          centered && containerStyles.centered,
          narrow || centered ? containerStyles.narrow : containerStyles.full,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Container
