import fetch from "node-fetch";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

const getSlugFromRestaurant = async (restaurant) => {
  const url = `https://ontopo.co.il/en/${restaurant}`;
  const response = await fetch(url).then((x) => x.text());
  const regex = /"pageId":(\s)?"(?<slug>\d*)"/g;
  const regexResult = regex.exec(response);
  return regexResult?.groups?.slug;
};

const isAvaliable = async (restaurant, persons, date, time, area) => {
  console.log(
    `Checking for "${restaurant}" ${
      area ? `in area "${area}"` : ""
    }, ${persons} persons, for time: ${time} at date: ${date}`
  );
  const toDisplay = (num) => (num < 10 ? "0" + num : `${num}`);
  
  const body = {
    // page_id: restaurant,
    slug: await getSlugFromRestaurant(restaurant),
    locale: "en-us",
    criteria: {
      size: String(persons),
      date: `${date.getFullYear()}${toDisplay(date.getMonth() + 1)}${toDisplay(
        date.getDate()
      )}`,
      time: String(time),
    },
  };
  
  const response = await fetch(
    "https://ontopo.co.il/api/availability/searchAvailability",
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      method: "POST",
    }
  ).then((x) => x.json());

  const options = area
    ? response?.areas?.find((a) => a.name === area)?.options
    : response?.areas?.flatMap((a) =>
        a.options.map((x) => ({ area: a, ...x }))
      );
  
  const option = options?.find((o) => o.time == time && o.method === "seat");
  return {
    isAvaliable: Boolean(option),
    ...option,
  };
};

const findDayByHour = async ({
  restaurant,
  persons,
  time,
  area,
  fromDate,
  interval,
}) => {
  
  const isFree = await isAvaliable(restaurant, persons, fromDate, time, area);

  return isFree.isAvaliable
    ? {
        date: fromDate,
        option: isFree,
      }
    : findDayByHour({
        restaurant,
        persons,
        time,
        area,
        fromDate: fromDate.addDays(interval),
        interval,
      });
};

const getAllOptions = async (restaurant) => {
  const toDisplay = (num) => (num < 10 ? "0" + num : `${num}`);
  const date = new Date();
  const body = {
    page_id: "cucinahess4",
    locale: "en",
    criteria: {
      size: "2",
      date: `${date.getFullYear()}${toDisplay(date.getMonth() + 1)}${toDisplay(
        date.getDate()
      )}`,
      time: "1900",
    },
  };
  console.log("#####", body);
  const response = await fetch(
    "https://ontopo.co.il/api/availability/searchAvailability",
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      method: "POST",
    }
  ).then((x) => x.json());
  console.log(response);
  return response?.area?.map((a) => a.id);
};

(async function () {
  const optionDefinitions = [
    {
      name: "restaurant",
      alias: "r",
      type: String,
      required: true,
      description: "The name from ontopo url, for example: mashya",
    },
    {
      name: "persons",
      alias: "p",
      type: Number,
      required: true,
      description: "The number of persons",
    },
    {
      name: "time",
      alias: "t",
      type: Number,
      required: true,
      description: "The time you wish to order, format is 1100 for 11am",
    },
    {
      name: "fromDate",
      alias: "d",
      type: String,
      required: false,
      defaultValue: new Date(),
      description:
        "The first date from which to search, in format of 2023-12-31",
    },
    {
      name: "interval",
      alias: "i",
      type: Number,
      required: false,
      defaultValue: 1,
      description: "How many days to jump between each scan",
    },
    {
      name: "area",
      alias: "a",
      type: String,
      required: false,
      defaultValue: null,
      description:
        "Specific area to use, for example in mashya the options are: Table, Bar, Table outside.\n Empty value will search all options",
    },
    {
      name: "help",
      alias: "h",
      type: Boolean,
      description: "Display this usage guide.",
    },
  ];
  const options = commandLineArgs(optionDefinitions);

  if (options.help) {
    const usage = commandLineUsage([
      {
        header: "Find Restaurant Table",
        content:
          "The script will search for a restaurant table based on your needs.",
      },
      {
        header: "Options",
        optionList: optionDefinitions,
      },
    ]);
    console.log(usage);
    process.exit(0);
  }
  const { restaurant, persons, time, interval, area } = options;
  const fromDate = options.fromDate ? new Date(options.fromDate) : new Date();
  console.log({ restaurant, persons, time, fromDate, interval, area });
  const {date} = await findDayByHour({
    restaurant,
    persons,
    time,
    fromDate,
    interval,
    area
  });
  const greenColor = "\x1b[32m";
  console.log(greenColor, `You can find a table for "${restaurant}" at ${time} on ${date}`)
  // const date = await findDayByHour({restaurant: "mashya",persons: 2,time: '1100', area: null, fromDate: new Date('2023-01-06'), interval: 7})
  // const date = await findDayByHour("nightkitchen","2","1800", "Bar - in the heart of the restaurant", new Date('2023-01-07'))
  //console.log(await getAllOptions("cucinahess4"))
  // const date = await findDayByHour("mashya","2","1100", null,new Date('10-14-2022'), 7)

  //const date = await findDayByHour("hasalon","2","2130", null, new Date('05-19-2022'), 7)
  // console.log(JSON.stringify(date))
  //const findDayByHour("cucinahess4", "2", 20:30);
})();
