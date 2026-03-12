"use client";
import CustomDropdown from "../ui/custom-dropdown";
import { useSignupStore } from "@/stores/useSignupStore";

interface FormSection3Props {
  country: string;
  setCountry: (country: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection3({
  country,
  setCountry,
  validationErrors,
}: FormSection3Props) {
  const firstname = useSignupStore((state) => state.firstname);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl gap-4 md:gap-6 px-4 sm:px-6">
      {/* Image - hidden on mobile, visible on md+ */}
      <div className="hidden md:flex flex-shrink-0 w-40 h-40 lg:w-[15.6vw] lg:h-[20.6vh] items-center justify-center mt-0 lg:mt-[4.3vh]">
        <img
          src="/lets-begin1.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100 w-full h-full"
        />
      </div>

      {/* Form content */}
      <div className="flex flex-col w-full max-w-sm">
        <h2 className="text-lg sm:text-xl lg:text-[1.4rem] font-display font-extrabold text-black mt-2 text-center md:text-left">
          Welcome {firstname ? `${firstname}!` : "!"}
        </h2>
        <p className="text-sm sm:text-base lg:text-[1rem] font-[700] font-display text-black mb-3 sm:mb-4 text-center md:text-left">
          Tell us where you are from
        </p>

        <div className="mb-2 w-full">
          <CustomDropdown
            options={[
              "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
              "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
              "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
              "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
              "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
              "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
              "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
              "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
              "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
              "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
              "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
              "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
              "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
              "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
              "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
              "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
              "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
              "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
              "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
              "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
              "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
              "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
              "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
              "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
              "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
              "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
              "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
              "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
              "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
              "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
              "Uganda", "Ukraine", "United Arab Emirates", "UK", "USA", "Uruguay",
              "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
              "Zambia", "Zimbabwe"
            ]}
            placeholder="Select your country"
            value={country}
            onChange={(value: string) => setCountry(value)}
          />
        </div>
        {validationErrors.country && (
          <p className="text-red-500 text-xs sm:text-sm font-railway mb-2">
            {validationErrors.country}
          </p>
        )}
      </div>
    </div>
  );
}
