import React from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui";
import { showNotificationMessage } from "@/utils/Helper";
import { useNavigate } from "react-router-dom";
// import { changePassword } from '@/services/AuthService'
import { changePassword } from "@/services/AuthService";
import { handleHttpReq } from "@/utils/HandleHttp";

// Validation schema
const PasswordChangeSchema = Yup.object().shape({
  old_password: Yup.string().required("Old password is required"),
  new_password: Yup.string().required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const PasswordChangeForm = () => {
  const navigate = useNavigate();

  const initialValues = {
    old_password: "",
    new_password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: any, resetForm: () => void) => {
    handleHttpReq(async () => {
      const { new_password, old_password } = values;
      console.log(new_password, old_password);

      const response = await changePassword({
        newPassword: new_password,
        oldPassword: old_password,
      });
      console.log(response);
      showNotificationMessage("Success", "Password changed successfully");
      resetForm();
      navigate("/");
    });
  };

  return (
    <>
      <h2 className="my-8">Change Password</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={PasswordChangeSchema}
        onSubmit={(values, { resetForm }) => {
          console.log("Submitted values:", values);
          handleSubmit(values, resetForm);
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="old_password"
                className="block text-sm mb-4 font-medium text-gray-700"
              >
                Old Password
              </label>
              <Field
                name="old_password"
                type="password"
                as={Input}
                placeholder="Enter old password"
                className={`mt-1 block w-full ${
                  errors.old_password && touched.old_password
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.old_password && touched.old_password && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.old_password}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="new_password"
                className="block text-sm mb-4 font-medium text-gray-700"
              >
                New Password
              </label>
              <Field
                name="new_password"
                type="password"
                as={Input}
                placeholder="Enter new password"
                className={`mt-1 block w-full ${
                  errors.new_password && touched.new_password
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.new_password && touched.new_password && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.new_password}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-4 font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <Field
                name="confirmPassword"
                type="password"
                as={Input}
                placeholder="Confirm new password"
                className={`mt-1 block w-full ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div>
              <Button type="submit">Submit</Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default PasswordChangeForm;
