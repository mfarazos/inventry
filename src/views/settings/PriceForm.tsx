import { AdaptableCard } from "@/components/shared";
import { Button, FormItem, Input } from "@/components/ui";
import { updateSttings } from "@/services/SettingService";
import { handleHttpReq } from "@/utils/HandleHttp";
import { showNotificationMessage } from "@/utils/Helper";
import { ErrorMessage, Field, Formik, Form } from "formik";
import * as Yup from "yup";

const NumberFieldsSchema = Yup.object().shape({
  first: Yup.number()
    .min(0)
    .required("First price is required")
    .typeError("Must be a number"),
  second: Yup.number()
    .min(0)
    .required("Second number is required")
    .typeError("Must be a number"),
  third: Yup.number()
    .min(0)
    .required("Third number is required")
    .typeError("Must be a number"),
});

const PrizeForm = ({ winnerPrize }: any) => {
  console.log(winnerPrize?.["1st"]);

  const initialValues = {
    first: winnerPrize?.["1st"] ?? "",
    second: winnerPrize?.["2nd"] ?? "",
    third: winnerPrize?.["3rd"] ?? "",
  };
  console.log(initialValues);
  const handleSubmit = async (values) => {
    handleHttpReq(async () => {
      console.log(values);
      const response = await updateSttings({
        winnerPrize: {
          "1st": values?.first,
          "2nd": values?.second,
          "3rd": values?.third,
        },
      });
      console.log(response);

      showNotificationMessage("success", "Winning prize updated");
    });
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={NumberFieldsSchema}
        enableReinitialize={true}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <h2>Prize Form</h2>
            <AdaptableCard divider className="mb-4">
              <FormItem
                label="First Winner Prize "
                invalid={(errors.first && touched.first) as boolean}
                errorMessage={errors.first}
              >
                <Field
                  type="number"
                  autoComplete="off"
                  name="first"
                  placeholder="Frist Price"
                  component={Input}
                />
              </FormItem>
              <FormItem
                label="Second Winner Prize "
                invalid={(errors.second && touched.second) as boolean}
                errorMessage={errors.second}
              >
                <Field
                  type="number"
                  autoComplete="off"
                  name="second"
                  placeholder="Second prize"
                  component={Input}
                />
              </FormItem>
              <FormItem
                label="Third Winner Prize "
                invalid={(errors.third && touched.third) as boolean}
                errorMessage={errors.third}
              >
                <Field
                  type="number"
                  autoComplete="off"
                  name="third"
                  placeholder="Third prize"
                  component={Input}
                />
              </FormItem>
              <div>
                <Button type="submit">Submit</Button>
              </div>
            </AdaptableCard>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default PrizeForm;
