# ontopo-find-a-table
ontopo-find-a-table is a command line tool that helps you find an available table at a restaurant.

## Installation
To install ontopo-find-a-table, run the following command:
```sh
npm install
```
## Usage
To use ontopo-find-a-table, run the following command:
```sh
npm start -- --restaurant <restaurant name> --persons <number of persons> --time <time in military format> --fromDate <date> --interval <interval in days> --area <area>
```
For example:
```sh
npm start -- --restaurant mashya --persons 2 --time 1100 --fromDate "2023-01-06" --interval 7 --area "Table outside"
```

This will search for a table at the restaurant "mashya" for 2 persons at time 1100, starting from the date "2023-01-06" and checking for availability every 7 days in the area "Table outside".

## Options
* `restaurant`: The name of the restaurant to search for a table.
* `persons`: The number of persons the table should be able to accommodate.
* `time`: The time to search for an available table in military format (e.g. 1100 for 11:00).
* `fromDate`: The date to start searching for an available table.
* `interval`: The interval in days to check for an available table.
* `area`: The area of the restaurant to search for a table (e.g. "Outside", "Bar", etc.).

## Help
To view the help for ontopo-find-a-table, run the following command:

```sh
npm start -- --help
```