import React, { useEffect } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, useFormikContext } from "formik";

type FormFieldsName = {
  bigBlind: number;
  smallBlind: number;
  buyInRange: [number, number];
};

type BasicInformationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors } = props;
  const { values, setFieldValue, handleChange } = useFormikContext<FormFieldsName>();

  useEffect(() => {
    let bigBlind = Math.ceil((values.buyInRange[1] / 100));
    setFieldValue("bigBlind", bigBlind  );
    setFieldValue("smallBlind", Math.ceil(bigBlind / 2));
  }, [values.buyInRange, setFieldValue]);

  const handleBigBlindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    setFieldValue("bigBlind", Number(e.target.value));
  };

  const handleBuyInRangeChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [...values.buyInRange];
      newValue[index] = Number(e.target.value);
      setFieldValue("buyInRange", newValue);
    };

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Basic Information</h5>
      <p className="mb-6">Section to config basic product information</p>

      <FormItem
        label="Small Blind"
        invalid={(errors.smallBlind && touched.smallBlind) as boolean}
        errorMessage={errors.smallBlind}
      >
        <Field
          readOnly
          type="number"
          autoComplete="off"
          name="smallBlind"
          placeholder="Small Blind"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Big Blind"
        invalid={(errors.bigBlind && touched.bigBlind) as boolean}
        errorMessage={errors.bigBlind}
      >
        <Field
        readOnly
          type="number"
          autoComplete="off"
          name="bigBlind"
          placeholder="Big Blind"
          component={Input}
          onChange={handleBigBlindChange}
        />
      </FormItem>

      <FormItem
        label="Buy In Range (Min)"
        invalid={(errors.buyInRange && touched.buyInRange) as boolean}
      >
        <Field
          type="number"
          autoComplete="off"
          name="buyInRange[0]"
          placeholder="Min Buy In Range"
          component={Input}
          onChange={handleBuyInRangeChange(0)}
          value={values.buyInRange[0]}
        />
      </FormItem>

      <FormItem
        label="Buy In Range (Max)"
        invalid={(errors.buyInRange && touched.buyInRange) as boolean}
      >
        <Field
          type="number"
          autoComplete="off"
          name="buyInRange[1]"
          placeholder="Max Buy In Range"
          component={Input}
          onChange={handleBuyInRangeChange(1)}
          value={values.buyInRange[1]}
        />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
