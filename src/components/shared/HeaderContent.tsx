import { HiOutlineSearch, HiPlusCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";

import { ChangeEvent } from "react";
import { summaryVarietyKeys } from "@/configs/mixingVarieties.config";

type HeaderContentProps = {
  text: string | JSX.Element;
  addButtonText1?: string;
  addLink1?: string;
  addButtonText2?: string;
  addLink2?: string;

  addButtonText3?: string;
  addLink3?: string;

  state?: any;
  onDialogOpen?: () => void;
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
    addButtonText3,
    addLink3,
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

  const navigate = useNavigate();

  const handleNavigate = (path: string, state?: any) => {
    navigate(path, { state });
  };

  const num = (value: any) => Number(value) || 0;

  // 21762.799999999996 jaisi values readable banane ke liye
  const fmt = (value: any) => {
    const amount = num(value);
    return Number.isInteger(amount)
      ? amount.toLocaleString()
      : amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  // backend har variety ka apna weight bhejta hai — mixing column unka total hai,
  // ye columns us total ki breakdown dikhate hain
  // product select hone par sirf usi ki varieties (client rules), warna saari
  const allowedVarietyKeys = summaryVarietyKeys(dropDownSelectedValue);

  const varieties: any[] = allowedVarietyKeys
    .map((key) =>
      (Array.isArray(weightData?.varieties) ? weightData.varieties : []).find(
        (variety: any) => variety?.key === key,
      ),
    )
    .filter(Boolean);

  const summaryRows = [
    {
      label: "Opening balance",
      pureKey: "openingBalanceWeightPure",
      mixingKey: "openingBalanceWeightMixing",
      varietyKey: "openingBalance",
    },
    {
      label: "Total dana received by party",
      pureKey: "purchaseWeightPure",
      mixingKey: "purchaseWeightMixing",
      varietyKey: "purchase",
    },
    {
      label: "Total dana received + openingBalance",
      pureKey: "totalPurchaseWeightPure",
      mixingKey: "totalPurchaseWeightMixing",
      varietyKey: "totalPurchase",
    },
    {
      label: "Total dana consumption",
      pureKey: "saleWeightPure",
      mixingKey: "saleWeightMixing",
      varietyKey: "sale",
    },
    {
      label: "Closing Balance",
      pureKey: "closingWeightPure",
      mixingKey: "closingWeightMixing",
      varietyKey: "closing",
      highlight: true,
    },
    {
      label: "Bags",
      pureKey: "Purebags",
      mixingKey: "Mixingbags",
      varietyKey: "purchaseBags",
    },
  ];

  const cellClass = "inventory-report-cell";

  return (
    <>
      <div className="inventory-page-header">
        <h1>{text}</h1>
        <div className="inventory-page-actions">
          {showSearch ? (
            <Input
              className="max-w-md md:w-56"
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
                  : dropDownOptions.find(
                      (item) => item.value === dropDownSelectedValue,
                    )
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
              className="h-9 min-w-[160px] border border-gray-300 rounded-md px-3 py-2 text-gray-800"
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
            <Button
              block
              variant="solid"
              onClick={onDialogOpen}
              size="sm"
              icon={<HiPlusCircle />}
            >
              {addButtonText1}
            </Button>
          )}

          {addButtonText3 && addLink3 && (
            <Link className="block lg:inline-block" to={addLink3} state={state}>
              <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                {addButtonText3}
              </Button>
            </Link>
          )}

          {addButtonText1 && addLink1 && (
            <Link className="block lg:inline-block" to={addLink1} state={state}>
              <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                {addButtonText1}
              </Button>
            </Link>
          )}

          {addButtonText2 && addLink2 && (
            <Link className="block lg:inline-block" to={addLink2} state={state}>
              <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                {addButtonText2}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {weightData && (
        <>
          <div className="inventory-summary-card">
            <div className="inventory-summary-head">
              <h2>Summary</h2>
              
            </div>
            <div className="inventory-summary-scroll">
            <table className="inventory-report-table">
              <thead>
                <tr>
                  <th className={cellClass}>stock purchases</th>
                  <th className={`${cellClass} is-num`}>pure</th>
                  {varieties.map((variety: any) => (
                    <th
                      key={variety.key}
                      className={`${cellClass} is-num is-variety`}
                    >
                      {variety.label}
                    </th>
                  ))}
                  <th className={`${cellClass} is-num`}>mixing</th>
                  <th className={`${cellClass} is-num is-total`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => {
                  const pure = num(weightData?.[row.pureKey]);
                  const mixing = num(weightData?.[row.mixingKey]);

                  return (
                    <tr
                      key={row.label}
                      className={row.highlight ? "is-highlight" : undefined}
                    >
                      <td className={cellClass}>{row.label}</td>
                      <td className={`${cellClass} is-num`}>{fmt(pure)}</td>
                      {varieties.map((variety: any) => (
                        <td
                          key={variety.key}
                          className={`${cellClass} is-num is-variety`}
                        >
                          {fmt(variety[row.varietyKey])}
                        </td>
                      ))}
                      <td className={`${cellClass} is-num`}>{fmt(mixing)}</td>
                      <td className={`${cellClass} is-num is-total`}>
                        {fmt(pure + mixing)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
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
    </>
  );
};

export default HeaderContent;
