import { Spinner } from '../ui'

const Loader = () => {
    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
                <Spinner size="90px" />
            </div>
        </>
    )
}

export default Loader
