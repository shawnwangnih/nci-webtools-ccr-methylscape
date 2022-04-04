// import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';

export default function MultiSearch({
  name,
  placeholder,
  value,
  onChange,
  ...rest
}) {
  const customStyle = {
    //   hide prompts and indicators
    noOptionsMessage: () => null,
    components: {
      DropdownIndicator: () => null,
      IndicatorSeparator: () => null,
    },
    styles: {
      control: (provided, state) => ({
        ...provided,
        borderRadius: '2rem',
        borderColor: 'rgb(111, 208, 178)',
        color: 'red',
      }),
    },
  };

  return (
    <AsyncCreatableSelect
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      isMulti
      formatCreateLabel={(userInput) => `${placeholder}: ${userInput}`}
      {...customStyle}
      {...rest}
    />
  );
}
