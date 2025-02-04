import React, { useContext, useState, useEffect } from 'react'
import { FaDev } from 'react-icons/fa';
import devtoApi from '../services/devto'
import CardComponent from "../components/CardComponent"
import ListComponent from "../components/ListComponent"
import { format } from 'timeago.js';
import PreferencesContext from '../preferences/PreferencesContext'
import CardLink from "../components/CardLink"
import { BiCommentDetail } from 'react-icons/bi';
import { MdAccessTime } from "react-icons/md"
import { AiOutlineLike } from "react-icons/ai"
import CardItemWithActions from '../components/CardItemWithActions'
import ColoredLanguagesBadge from "../components/ColoredLanguagesBadge"


const ArticleItem = ({ item, index, analyticsTag }) => {

  const { listingMode } = useContext(PreferencesContext)

  return (
    <CardItemWithActions
      source={'devto'}
      index={index}
      key={index}
      item={item}
      cardItem={(
        <>
          <CardLink link={item.url} analyticsSource={analyticsTag}>
            { listingMode === "compact" && 
                <div className="counterWrapper">
                  <AiOutlineLike/>
                  <span className="value">{item.public_reactions_count}</span>
                </div>
            }
            <div className="subTitle">
              {item.title}
            </div>
          </CardLink>

          {
            listingMode === "normal" &&
            <>
              <p className="rowDescription">
                <span className="rowItem"><MdAccessTime className={"rowTitleIcon"} />{format(new Date(item.published_at))}</span>
                <span className="rowItem"><BiCommentDetail className={"rowTitleIcon"} />{item.comments_count} comments</span>
                <span className="rowItem"><AiOutlineLike className={"rowTitleIcon"} />{item.public_reactions_count} reactions</span>
              </p>
              <p className="rowDetails">
                <ColoredLanguagesBadge languages={item.tag_list} />
              </p>
            </>
          }
          
        </>
      )}
    />
  )
}



function DevToCard({ analyticsTag, label, icon, withAds }) {
  const preferences = useContext(PreferencesContext)
  const { userSelectedTags } = preferences

  const [refresh, setRefresh] = useState(true)

  useEffect(() => {
    setRefresh(!refresh)
  }, [userSelectedTags])

  const fetchArticles = async () => {
    const promises = userSelectedTags.map((tag) => {
      if (tag.devtoValues) {
        return devtoApi.getArticles(tag.devtoValues[0])
      }
      return []
    })

    const results = await Promise.allSettled(promises)
    return results
      .map((res) => {
        let value = res.value
        if (res.status === 'rejected') {
          value = []
        }
        return value
      })
      .flat()
      .sort((a, b) => b.public_reactions_count - a.public_reactions_count)
  }

  const renderItem = (item, index) => (
    <ArticleItem item={item} key={`at-${index}`} index={index} analyticsTag={analyticsTag} />
  )

  return (
    <CardComponent
      icon={<span className="blockHeaderIcon">{icon}</span>}
      title={label}
      link="https://dev.to/">
      <ListComponent
        fetchData={fetchArticles}
        renderItem={renderItem}
        refresh={refresh}
        withAds={withAds}
      />
    </CardComponent>
  )
}

export default DevToCard