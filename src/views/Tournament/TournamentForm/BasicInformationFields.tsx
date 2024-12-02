import React, { useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FormFieldsName = {
  name: string;
  description: string;
  winnerPrize: Array<number>;
  image: string;
  entryChips: number;
  tournamentStartDate: string;
  maxUserInTournament: number;
  minUserInTournament: number;
  tournamentDuration: number;
};

type BasicInformationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors, page } = props;

  // Local state to manage date values
  const [dates, setDates] = useState({
    tournamentStartDate: new Date(),
  });

  // Handle date changes locally
  const handleDateChange = (field: string, date: Date) => {
    setDates((prevDates) => ({
      ...prevDates,
      [field]: date,
    }));
  };

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Tournament Form</h5>
      <p className="mb-6">Section to configure basic tournament information</p>

      <FormItem
        label="Name"
        invalid={Boolean(errors.name && touched.name)}
        errorMessage={errors.name}
      >
        <Field type="text" autoComplete="off" name="name" component={Input} />
      </FormItem>

      <FormItem
        label="Description"
        invalid={Boolean(errors.description && touched.description)}
        errorMessage={errors.description}
      >
        <Field
          type="text"
          autoComplete="off"
          name="description"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Entry Chips"
        invalid={Boolean(errors.entryChips && touched.entryChips)}
        errorMessage={errors.entryChips}
      >
        <Field
          type="number"
          autoComplete="off"
          name="entryChips"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Max Users in Tournament"
        invalid={Boolean(
          errors.maxUserInTournament && touched.maxUserInTournament
        )}
        errorMessage={errors.maxUserInTournament}
      >
        <Field
          type="number"
          autoComplete="off"
          name="maxUserInTournament"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Tournament Duration"
        invalid={Boolean(
          errors.tournamentDuration && touched.tournamentDuration
        )}
        errorMessage={errors.tournamentDuration}
      >
        <Field
          type="number"
          autoComplete="off"
          name="tournamentDuration"
          component={Input}
        />
      </FormItem>

      

      
          <FormItem label="Tournament Start Date">
            <DatePicker
              selected={dates.tournamentStartDate}
              onChange={(date: Date | null) => {
                if (date) {
                  handleDateChange("tournamentStartDate", date);
                }
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}  // Optional: You can adjust the interval for time selection
              dateFormat="yyyy-MM-dd HH:mm"
            />
          </FormItem>

      

      <FormItem
        label="Min Users in Tournament"
        invalid={Boolean(
          errors.minUserInTournament && touched.minUserInTournament
        )}
        errorMessage={errors.minUserInTournament}
      >
        <Field
          type="number"
          autoComplete="off"
          name="minUserInTournament"
          component={Input}
        />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
