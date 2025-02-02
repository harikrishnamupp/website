import React from 'react'
import { graphql } from 'gatsby'
import Layout from '~components/layout'
import LTCForm from '~components/pages/data/long-term-care/form'
import ContentfulContent from '~components/common/contentful-content'

const LTCContactPage = ({ data }) => (
  <Layout
    title="Long-Term Care: Contact us"
    returnLinks={[{ link: '/nursing-homes-long-term-care-facilities' }]}
    centered
  >
    <ContentfulContent
      content={
        data.contentfulSnippet.childContentfulSnippetContentTextNode
          .childMarkdownRemark.html
      }
      id={data.contentfulSnippet.contentful_id}
    />
    <LTCForm />
  </Layout>
)

export default LTCContactPage

export const query = graphql`
  query {
    contentfulSnippet(slug: { eq: "ltc-contact-preamble" }) {
      contentful_id
      childContentfulSnippetContentTextNode {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`
