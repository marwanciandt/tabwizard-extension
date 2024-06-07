import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import {
  fetchOpenWeatherData,
  OpenWeatherData,
  OpenWeatherTempScale,
} from "../../apis/weather_api";
import { queryLLM } from "../../apis/llm_api";

type WeatherCardState = "loading" | "error" | "ready";

const WeatherCardContainer: React.FC<{
  children: React.ReactNode;
  onDelete?: () => void;
}> = ({ children, onDelete }) => {
  return (
    <Box mx={"4px"} my={"16px"}>
      <Card>
        <CardContent>{children}</CardContent>
        <CardActions>
          {onDelete && (
            <Button color="secondary" onClick={onDelete}>
              Delete
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

const WeatherCard: React.FC<{
  city: string;
  tempScale: OpenWeatherTempScale;
  onDelete?: () => void;
}> = ({ city, tempScale, onDelete }) => {
  const [weatherData, setWeatherData] = useState<OpenWeatherData | null>(null);
  const [cardState, setCardState] = useState<WeatherCardState>("loading");

  useEffect(() => {
    fetchOpenWeatherData(city, tempScale)
      .then((data) => {
        setWeatherData(data);
        setCardState("ready");
      })
      .catch((error) => {
        setCardState("error");
      });
  }, [city, tempScale]);

  useEffect(() => {
    queryLLM("weather holiday greece flight ticket sunscreen boat trip")
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (cardState == "loading" || cardState == "error") {
    return (
      <WeatherCardContainer onDelete={onDelete}>
        <Typography variant="body1">
          {cardState == "loading"
            ? "Loading ... "
            : "Error : could not retrieve weather data for city"}
        </Typography>
      </WeatherCardContainer>
    );
  }

  return (
    <WeatherCardContainer onDelete={onDelete}>
      <CardContent>
        <Typography variant="h5">{weatherData.name}</Typography>
        <Typography variant="body1">
          {Math.round(weatherData.main.temp)}
        </Typography>
        <Typography variant="body1">
          Feels like: {Math.round(weatherData.main.feels_like)}
        </Typography>
      </CardContent>
    </WeatherCardContainer>
  );
};

export default WeatherCard;
