import React, { useImperativeHandle, useState } from 'react'
import Loader from './components/internal/Loader'

const TopLoader = (props: any, forwardedRef: any) => {
    //set default state
    const [isVisibale, setIsVisible] = useState(false)

    // hide modal function
    const hideMoadl = () => {
        setIsVisible(false)
    }

    // show and hide functions for ref
    useImperativeHandle(forwardedRef, () => ({
        show: () => {
            setIsVisible(true)
        },
        hide: () => {
            hideMoadl()
        },
    }))

    if (isVisibale) {
        return <Loader />
    }
    return null
}

export default React.forwardRef(TopLoader)
