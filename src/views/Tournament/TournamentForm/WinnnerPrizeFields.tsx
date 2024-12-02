import AdaptableCard from "@/components/shared/AdaptableCard";
import { FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { Field, FormikErrors, FormikTouched, FieldArray } from "formik";

type initialData = {
  winnerPrize: Array<number>;
  [key: string]: any;
};

type OrganizationFieldsProps = {
  touched: FormikTouched<initialData>;
  errors: FormikErrors<initialData>;
  page: "new" | "edit";
  values: initialData;
};

const WinnerPrizeField = (props: OrganizationFieldsProps) => {
  const { values, touched, errors, page } = props;

  // Ensure the first prize is always present
  if (values.winnerPrize.length === 0) {
    values.winnerPrize.push(0);
  }
  console.log(
    "?? Values ?? ",
    Object.values(values.winnerPrize[0]).map((value, index) => value)
  );

  console.log("?? Keys ?? ", Object.keys(values.winnerPrize[0]));
  return (
    <AdaptableCard divider isLastChild className="mb-4">
      <h5>Winner Prize</h5>
      <p className="mb-6">Section to configure the product attribute</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Other form items here if needed */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem label="Winner Prizes">
            <FieldArray name="winnerPrize">
              {({ push, remove }) => (
                <>
                  {values.winnerPrize.map((prize, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <Field
                        type="number"
                        name={`winnerPrize.${index}`}
                        component={Input}
                        placeholder={`Prize ${index + 1}`}
                        className="mr-2"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="bg-red-500 text-white p-1 rounded"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push(0)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Add Prize
                  </button>
                </>
              )}
            </FieldArray>
          </FormItem>
        </div>
      </div>
    </AdaptableCard>
  );
};

export default WinnerPrizeField;
