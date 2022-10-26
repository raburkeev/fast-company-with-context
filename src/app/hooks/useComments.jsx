import React, {useContext, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import PropTypes from 'prop-types'
import {useAuth} from './useAuth'
import {nanoid} from 'nanoid'
import commentService from '../services/comment.service'
import {toast} from 'react-toastify'

const CommentsContext = React.createContext()

export const useComments = () => {
    return useContext(CommentsContext)
}

export const CommentsProvider = ({children}) => {
    const {userId} = useParams()
    const {currentUser} = useAuth()
    const [comments, setComments] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    useEffect(() => {
        getComments()
    }, [userId])

    async function createComment(data) {
        const comment = {
            ...data,
            _id: nanoid(),
            pageId: userId,
            userId: currentUser._id,
            created_at: Date.now()
        }
        try {
            const {content} = await commentService.createComment(comment)
            setComments(prevState => [...prevState, content])
        } catch (error) {
            errorCatcher(error)
        }
    }

    async function getComments() {
        try {
            const {content} = await commentService.getComments(userId)
            setComments(content)
        } catch (error) {
            errorCatcher(error)
        } finally {
            setLoading(false)
        }
    }

    async function removeComment(commentId) {
        try {
            const {content} = await commentService.removeComment(commentId)
            if (content === null) {
                setComments(prevState => prevState.filter(comment => comment._id !== commentId))
            }
        } catch (error) {
            errorCatcher(error)
        }
    }

    function errorCatcher(error) {
        const {message} = error.response.data
        setError(message)
    }
    useEffect(() => {
        if (error !== null) {
            toast.error(error)
            setError(null)
        }
    }, [error])

    return (
        <CommentsContext.Provider value={{comments, createComment, isLoading, removeComment}}>
            {children}
        </CommentsContext.Provider>
    )
}

CommentsProvider.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
}
