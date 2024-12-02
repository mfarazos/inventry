import { AdaptableCard } from "@/components/shared";
import { Button, FormItem, Input } from "@/components/ui";
import { updateSttings } from "@/services/SettingService";
import { handleHttpReq } from "@/utils/HandleHttp";
import { showNotificationMessage } from "@/utils/Helper";
import { Field, Formik, Form } from "formik";
import * as Yup from "yup";

// Validation schema for the form
const minDailyGamesSchema = Yup.object().shape({
  minDailyGames: Yup.number().min(0)
    .required("Winning streak is required")
    .typeError("Must be a number"),
});

const minDailyGamesForm = ({minDailyGames}) => {
    console.log(minDailyGames);
    
  // Initial values for the form fields
  const initialValues = {
    minDailyGames: minDailyGames ??"",
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={minDailyGamesSchema}
        enableReinitialize={true}
        onSubmit={async(values) => {
          handleHttpReq(async()=>{
            const response=await updateSttings(values)
            showNotificationMessage("success","Daily games Streak updated successfully");
            
          })
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <h2>Winning Streak Form</h2>
            <AdaptableCard divider className="mb-4">
              <FormItem
                label="Winning Streak"
                invalid={Boolean(errors.minDailyGames && touched.minDailyGames)}
                errorMessage={errors.minDailyGames}
              >
                <Field
                  type="number"
                  autoComplete="off"
                  name="minDailyGames"
                  placeholder="Enter winning streak"
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

export default minDailyGamesForm;
