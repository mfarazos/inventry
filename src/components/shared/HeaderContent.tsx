import { HiOutlineSearch, HiPlusCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { Link } from "react-router-dom";
import { ChangeEvent } from "react";

type HeaderContentProps = {
  text: string;
  addButtonText1?: string;
  addLink1?: string;
  addButtonText2?: string;
  addLink2?: string;
  
  state?: any;
  onDialogOpen?: () => void
  isModal?: boolean;
  showSearch?: boolean;
  onEditSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeMonth?: (selectedMonth: string) => void; // Accepts a string
  dropDownOptions?: { value: string; label: string }[];
  weightData?: any;
  billData?: any;
  dropDownSelectedValue?: string;
  selectedMonth?: string;
  isMonthPicket?: boolean;
  onChangeDropDown?: (item: string) => void;
  openingBalance?: string; // New prop for Opening Balance
  closingBalance?: string; // New prop for Closing Balance
  
};

const allOption = { value: "", label: "All" };

const HeaderContent = (props: HeaderContentProps) => {
  const {
    text,
    addButtonText1,
    addLink1,
    addButtonText2,
    addLink2,
    isModal,
    onDialogOpen,
    state,
    showSearch = false,
    onEditSearch,
    dropDownOptions,
    onChangeMonth,
    weightData,
    billData,
    selectedMonth,
    isMonthPicket,
    dropDownSelectedValue,
    onChangeDropDown,
    openingBalance = "0.00", // Default value
    closingBalance = "0.00", // Default value
  } = props;

  

  return (
    <>
      <div className="lg:flex items-center justify-between mb-4">
        <h1 className="mb- lg:mb-0">{text}</h1>
        <div className="flex flex-col lg:flex-row lg:items-center space-x-3">
          {showSearch ? (
            <Input
              className="max-w-md md:w-52 md:mb-0 mb-4"
              size="sm"
              
              placeholder="Search"
              prefix={<HiOutlineSearch className="text-lg" />}
              onChange={onEditSearch} 
            />
          ) : null}
  
          {dropDownOptions ? (
            <Select
              size="sm"
              options={dropDownOptions}
              value={
                dropDownSelectedValue === ""
                  ? allOption
                  : dropDownOptions.find((item) => item.value === dropDownSelectedValue)
              }
              onChange={(item) => {
                console.log(item);
                onChangeDropDown!(item?.value ?? "");
              }}
              styles={{
                singleValue: (provided, state) => ({
                  ...provided,
                  fontWeight: "bold", // Makes the selected value bold
                }),
                control: (provided, state) => ({
                  ...provided,
                  borderColor: state.isFocused ? "blue" : "lightgray", // Optional: Add focused border for better UX
                  boxShadow: state.isFocused ? "0 0 3px blue" : "none",
                }),
              }}
            />
          ) : null}
  
          {isMonthPicket ? (
            <input
              type="month"
              id="bdaymonth"
              name="bdaymonth"
              defaultValue={selectedMonth}
              className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              onChange={(e) => {
                const selectedMonth = e.target.value; // Extract the selected month value
                console.log("Selected Month:", selectedMonth);
                if (onChangeMonth) {
                  onChangeMonth(selectedMonth); // Invoke the callback only if it is defined
                }
              }}
            />
          ) : null}
  
          {isModal && onDialogOpen && (
            <Button block variant="solid" onClick={onDialogOpen} size="sm" icon={<HiPlusCircle />}>
              {addButtonText1}
            </Button>
          )}
  
          {addButtonText1 && addLink1 && (
            <Link className="block lg:inline-block md:mb-0 mb-4" to={addLink1} state={state}>
              <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                {addButtonText1}
              </Button>
            </Link>
          )}

           {addButtonText2 && addLink2 && (
            <Link className="block lg:inline-block md:mb-0 mb-4" to={addLink2} state={state}>
              <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                {addButtonText2}
              </Button>
            </Link>
          )}
        </div>
      </div>
  
      {weightData && (
        <>
          <div className="overflow-x-auto mt-4">
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2">stock purchases</th>
            <th className="border border-gray-400 px-4 py-2">pure</th>
            <th className="border border-gray-400 px-4 py-2">mixing </th>
            <th className="border border-gray-400 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-4 py-2">Opening balance</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?.openingBalanceWeightPure || 0}</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?.openingBalanceWeightMixing || 0}</td>
            <td className="border border-gray-400 px-4 py-2">
              {(weightData?.openingBalanceWeightPure || 0) + (weightData?.openingBalanceWeightMixing || 0)}
            </td>
          </tr>
          
          
         
    <tr>
       <td className="border border-gray-400 px-4 py-2">Total dana received by party</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.purchaseWeightPure || 0}</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.purchaseWeightMixing || 0}</td>
       <td className="border border-gray-400 px-4 py-2">
      {(weightData?.purchaseWeightPure || 0) + (weightData?.purchaseWeightMixing || 0)}
       </td>
     </tr>

     <tr>
       <td className="border border-gray-400 px-4 py-2">Total dana received + openingBalance</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.totalPurchaseWeightPure || 0}</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.totalPurchaseWeightMixing || 0}</td>
       <td className="border border-gray-400 px-4 py-2">
      {(weightData?.totalPurchaseWeightPure || 0) + (weightData?.totalPurchaseWeightMixing || 0)}
       </td>
     </tr>

     <tr>
       <td className="border border-gray-400 px-4 py-2">Total dana consumption</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.saleWeightPure || 0}</td>
       <td className="border border-gray-400 px-4 py-2">{weightData?.saleWeightMixing || 0}</td>
       <td className="border border-gray-400 px-4 py-2">
      {(weightData?.saleWeightPure || 0) + (weightData?.saleWeightMixing || 0)}
       </td>
     </tr>
    

          
          <tr>
            <td className="border border-gray-400 px-4 py-2">Closing Balance</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?.closingWeightPure || 0}</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?.closingWeightMixing || 0}</td>
            <td className="border border-gray-400 px-4 py-2">
              {(weightData?.closingWeightPure || 0) + (weightData?.closingWeightMixing || 0)}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-400 px-4 py-2">Bags</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?.Purebags || 0}</td>
            <td className="border border-gray-400 px-4 py-2">{weightData?. Mixingbags || 0}</td>
            <td className="border border-gray-400 px-4 py-2">
              {(weightData?.Purebags || 0) + (weightData?.Mixingbags || 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
          
          
          {/* <div className="lg:flex items-center justify-between mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-x-3">
              <label className="block text-sm font-medium text-gray-700">
                Opening Balance of weight pure:
              </label>
              <input
                type="text"
                value={weightData?.openingWeight?.weightPure || 0}
                readOnly
                className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              />
  
              <label className="block text-sm font-medium text-gray-700">
                Opening Balance of weight mixing:
              </label>
              <input
                type="text"
                value={weightData?.openingWeight?.weightMixing || 0}
                readOnly
                className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              />
            </div>
          </div>
  
          <div className="lg:flex items-center justify-between mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-x-3">
              <label className="block text-sm font-medium text-gray-700">
                Closing Balance of weight pure:
              </label>
              <input
                type="text"
                value={weightData?.closingWeight?.weightPure || 0}
                readOnly
                className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              />
  
              <label className="block text-sm font-medium text-gray-700">
                Closing Balance of weight mixing:
              </label>
              <input
                type="text"
                value={weightData?.closingWeight?.weightMixing || 0}
                readOnly
                className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              />
            </div>
          </div> */}
        </>
      )}
  
      {billData && (
        <>
          <div className="lg:flex items-center justify-between mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-x-3">
              <label className="block text-sm font-medium text-gray-700">
                Bill number:
              </label>
              <input
                type="text"
                value={billData?.[0] || 0} // Here, we're using the first element of the billData array
                readOnly
                className="border border-gray-500 rounded-md px-3 py-2 text-gray-800"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
} 

  
export default HeaderContent; 
