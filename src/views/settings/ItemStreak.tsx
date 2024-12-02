import React from "react";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { AdaptableCard } from "@/components/shared";
import { Button, FormItem, Input } from "@/components/ui";
import { values } from "lodash";
import { handleHttpReq } from "@/utils/HandleHttp";
import { updateSttings } from "@/services/SettingService";
import { showNotificationMessage } from "@/utils/Helper";
import { useNavigate } from "react-router-dom";

// Validation schema
const UnlockItemSchema = Yup.object().shape({
  items: Yup.array().of(
  Yup.object().shape({
      consecutiveDays: Yup.number()
        .min(1)
        .required("Streak is required ")
        .typeError("Must be a number"),
    })
  ),
});

const UnlockItemForm = ({ UnlockItem }) => {
  console.log(UnlockItem);

  const navigate = useNavigate();
  console.log();

  const handleSubmit = async (values, reset) => {
    handleHttpReq(async () => {
      const response = await updateSttings(values);
      console.log(response);
      console.log(values);

      showNotificationMessage("success", "Item Streak Updated successfully");
    });
  };
  const initialValues = {
    UnlockItemStreak: UnlockItem?.map((item) => ({
      consecutiveDays: item.consecutiveDays,
      shortCode: item.shortCode,
      productId: item.productId,
    })),
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={UnlockItemSchema}
      enableReinitialize={true}
      onSubmit={(values, { resetForm }) => {
        handleSubmit(values, resetForm);
        // Handle form submission here
      }}
    >
      {({ touched, errors }) => (
        <Form>
          <h2>Item Streak Days</h2>
          <AdaptableCard divider className="mb-4">
            <FieldArray name="UnlockItemStreak">
              {({ insert, remove, push }) => (
                <div>
                  {initialValues.UnlockItemStreak?.length > 0 &&
                    initialValues.UnlockItemStreak.map((item, index) => (
                      <div key={index}>
                        <FormItem
                          label={`Item ${index + 1} - ${item.shortCode}`}
                          labelClass="min-w-36"
                          invalid={
                            (errors.UnlockItemStreak &&
                              touched.UnlockItemStreak &&
                              errors.UnlockItemStreak[index]?.consecutiveDays &&
                              touched.UnlockItemStreak[index]
                                ?.consecutiveDays) as boolean
                          }
                          errorMessage={
                            errors.UnlockItemStreak &&
                            errors.UnlockItemStreak[index]?.consecutiveDays
                          }
                          className="w-62 inline"
                        >
                          <Field
                            type="number"
                            name={`UnlockItemStreak.${index}.consecutiveDays`}
                            placeholder="Enter Consecutive Days"
                            component={Input}
                          />
                        </FormItem>
                      </div>
                    ))}
                </div>
              )}
            </FieldArray>
            <div>
              <Button type="submit">Submit</Button>
            </div>
          </AdaptableCard>
        </Form>
      )}
    </Formik>
  );
};

export default UnlockItemForm;
