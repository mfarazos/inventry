import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  console.log("THIS IS CURRENT PAGE", currentPage);
  console.log("THIS IS total PAGE", totalPages);
  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  console.log("CURRENT PAGE & TOTAL PAGE??", currentPage, totalPages);

  return (
    <div className="flex justify-center items-center mt-4 w-96">
      <button
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="p-2">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
