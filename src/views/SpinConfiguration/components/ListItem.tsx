import Card from '@/components/ui/Card'
import { useState } from 'react'

import { HiOutlineClipboardCheck } from 'react-icons/hi'
import { Link } from 'react-router-dom'

export type ListItemData = {
    id: number
    name: string
    category: string
    desc: string
    attachmentCount: number
    totalTask: number
    completedTask: number
    progression: number
    dayleft: number
    status: string
    member: {
        name: string
        img: string
    }[]
}

type ListItemProps = {
    data: ListItemData
    cardBorder?: boolean
}

const ListItem = ({ data, cardBorder, onUpdate }: any) => {
    const { _id, combination, value } = data;
    const [editableValue, setEditableValue] = useState(value);
    const images = ["https://cubixco.s3.us-west-2.amazonaws.com/2xYC0GfIDvD6HznSxIqsB.png","https://cubixco.s3.us-west-2.amazonaws.com/eiB6Z1uJN-o5hdtO4lTCg.png","https://cubixco.s3.us-west-2.amazonaws.com/FbkpA3UouS7nTyEy2G_5r.png","https://cubixco.s3.us-west-2.amazonaws.com/eCzwiik5TccQxitJxCSZn.png","https://cubixco.s3.us-west-2.amazonaws.com/9vrw0T7HGOceKPYSh5kSL.png"]

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableValue(e.target.value);
    };

    const handleUpdate = () => {
        if (onUpdate) {
            onUpdate(_id, editableValue);
        }
    };

    return (
        <div className="mb-4">
            <Card bordered={cardBorder}>
                <div className="grid gap-x-4 grid-cols-12">
                    <div className="my-1 sm:my-0 col-span-12 sm:col-span-2 md:col-span-3 lg:col-span-3 md:flex md:items-center">
                        <div className="flex flex-col">
                            <h6 className="font-bold">
                            <div className="flex">
                                {/* <Link to="/app/project/scrum-board"> */}
                                {combination.map((number: number, index: number) => {
                                    const imageUrl = images[number - 1];
                                    return (
                                        <img 
                                            key={index}
                                            src={imageUrl}
                                            alt={`Combination ${number}`}
                                            className="w-8 h-8 mr-2"
                                        />
                                    );
                                })}
                                </div>
                                {/* </Link> */}
                            </h6>
                            <input
                                type="text"
                                value={editableValue}
                                onChange={handleValueChange}
                                className="border rounded px-2 py-1"
                            />
                            <button
                                onClick={handleUpdate}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ListItem
