export interface Pagination {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    nextPage: number
    page: number
    pagingCounter: number
    prevPage: number
    total: number
    totalDocs: number
    totalPages: number
}
