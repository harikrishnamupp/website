import React from 'react'
import classnames from 'classnames'
import Container from '~components/common/container'
import { Row, Col } from '~components/common/grid'
import spacers from './spacers.module.scss'
import grid from './grid.module.scss'

export default {
  title: 'Layout',
}

const SampleContainer = () => (
  <div style={{ background: 'grey', height: '200px' }} />
)

export const container = () => (
  <Container>
    <SampleContainer />
  </Container>
)
container.story = {
  parameters: {
    info: {
      text:
        'An element that floats in the middle of the page and is useful to wrap content.',
    },
  },
}

export const containerNarrow = () => (
  <Container narrow>
    <SampleContainer />
  </Container>
)
containerNarrow.story = {
  parameters: {
    info: {
      text:
        'A narrow element that aligns to the left side of the page and is useful to wrap long content within a full container.',
    },
  },
}

export const containerCentered = () => (
  <Container centered>
    <SampleContainer />
  </Container>
)
containerCentered.story = {
  parameters: {
    info: {
      text:
        'A centered container, uses the same width as the `narrow` container, but centered on the page in large breakpoints. This should be used for pages of long content.',
    },
  },
}

const spacerItems = []
Object.keys(spacers).forEach(spacer => {
  if (spacer.search('spacer-') > -1) {
    spacerItems.push({
      class: spacer,
      size: spacer.replace('spacer-', ''),
    })
  }
})

export const spacing = () => (
  <>
    <p>
      Instead of using absolute sizes for margins and paddings, use our standard
      spacers. For example:
    </p>
    <code>
      <pre>
        {`.my-class {
  margin: spacer(16);
}`}
      </pre>
    </code>
    {spacerItems.map(spacer => (
      <div className={spacers.key} key={spacer.size}>
        <div className={spacers.wrap}>
          <div className={classnames(spacers.spacer, spacers[spacer.class])} />
        </div>
        <code>spacer({spacer.size})</code>
      </div>
    ))}
  </>
)

containerNarrow.story = {
  parameters: {
    info: {
      text: 'Use the mixin `spacer([number]) to define margins and padding.',
    },
  },
}

export const grids = () => (
  <>
    <Row>
      <Col width={[4, 3, 3]}>
        <div className={grid.col}>{`<Col width={[4, 3, 3]}>`}</div>
      </Col>
      <Col width={[4, 3, 3]}>
        <div className={grid.col}>{`<Col width={[4, 3, 3]}>`}</div>
      </Col>
      <Col width={[4, 3, 3]}>
        <div className={grid.col}>{`<Col width={[4, 3, 3]}>`}</div>
      </Col>
      <Col width={[4, 3, 3]}>
        <div className={grid.col}>{`<Col width={[4, 3, 3]}>`}</div>
      </Col>
    </Row>
    <Row>
      <Col width={[1, 3, 6]}>
        <div className={grid.col}>{`<Col width={[1, 3, 6]}>`}</div>
      </Col>
      <Col width={[1, 3, 6]}>
        <div className={grid.col}>{`<Col width={[1, 3, 6]}>`}</div>
      </Col>
    </Row>
    <Row>
      <Col width={[2, 3, 8]}>
        <div className={grid.col}>{`<Col width={[2, 3, 8]}>`}</div>
      </Col>
      <Col width={[1, 3, 4]} paddingLeft={[6, 8, 32]}>
        <div
          className={grid.col}
        >{`<Col width={[1, 3, 4]} paddingLeft={[6, 8, 32]}>`}</div>
      </Col>
    </Row>
    <h4>Things to know</h4>
    <p>
      The grid system has a predfined number of cols per row for each screen
      size.
    </p>
    <ul>
      <li>Small - 4 cols</li>
      <li>Medium - 6 cols</li>
      <li>Large - 12 cols</li>
    </ul>
    <p>
      The <code>width</code> prop of the <code>Col</code> component takes an
      array which specifies the number of cols the item should take up for each
      screensize.
    </p>
    <code>
      {
        'width={[<COLS_ON_SMALL_SCREEN>,<COLS_ON_MEDIUM_SCREEN>,<COLS_ON_LARGE_SCREEN>]}'
      }
    </code>
  </>
)

grid.story = {
  parameters: {
    info: {
      text: 'Use the mixin `spacer([number]) to define margins and padding.',
    },
  },
}

export const gridWithSass = () => (
  <div>
    <p>
      Use the <code>row()</code> and <code>col()</code> mixins to add grids to
      your components. The <code>col()</code> accepts three widths that need to
      all be set: <code>small medium large</code>.
    </p>

    <p>
      To control the padding of each column, the second argument is a list of
      spacers for the left padding, and the third argument is a list of spacers
      for the right padding.
    </p>
    <div className={grid.row}>
      <div className={grid.half}>
        <div className={grid.col}>col(2 3 6)</div>
      </div>
      <div className={grid.quarter}>
        <div className={grid.col}>col(1 2 3)</div>
      </div>
      <div className={grid.quarter}>
        <div className={grid.col}>col(1 2 3)</div>
      </div>
    </div>

    <div className={grid.row}>
      <div className={grid.twoThirds}>
        <div className={grid.col}>col(4 3 9)</div>
      </div>
      <div className={grid.oneThird}>
        <div className={grid.col}>col(4 3 4, 8 16 32)</div>
      </div>
    </div>
    <div className={grid.row}>
      <div className={grid.full}>
        <div className={grid.col}>col(4 6 12)</div>
      </div>
    </div>
  </div>
)
