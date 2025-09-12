from flask import Flask, render_template, request, redirect, url_for, make_response
from markupsafe import escape
import os
import json
import datetime
from markupsafe import Markup
import yfinance as yf
import hashlib
import time
import base64
import requests
import random
import numpy as np
import sqlite3
import uuid
import datetime


app = Flask(__name__)


@app.route("/top-movers", methods=["GET"])
def top_movers():
    API_KEY = ""

    gainers_url = (
        f"https://financialmodelingprep.com/stable/biggest-gainers?apikey={API_KEY}"
    )
    gainers = requests.get(gainers_url).json()[:15]

    losers_url = (
        f"https://financialmodelingprep.com/stable/biggest-losers?apikey={API_KEY}"
    )
    losers = requests.get(losers_url).json()[:15]

    new = []
    for gainer in gainers:
        new.append(
            [
                gainer["symbol"],
                gainer["name"],
                gainer["changesPercentage"],
                gainer["exchange"],
            ]
        )
    gainers[:] = new

    new = []
    for loser in losers:
        new.append(
            [
                loser["symbol"],
                loser["name"],
                loser["changesPercentage"],
                loser["exchange"],
            ]
        )
    losers[:] = new

    return {"gainers": gainers, "losers": losers}


@app.route("/news-fetch", methods=["POST", "GET"])
def news_fetch():

    # fetching data in json format
    keyword = request.args.get("keyword")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    res = requests.get(
        f"https://newsapi.org/v2/everything?q={keyword}&from={from_date}&to={to_date}&sortBy=popularity&apiKey= "
    )
    result = res.json()
    returnable = []
    for article in result["articles"]:
        returnable.append(article)
    return {"news": returnable}, 200


global macro_data
with open("macro_data.json", "r") as f:
    macro_data = f.read()
    macro_data = json.loads(macro_data)


@app.route("/country_data", methods=["GET", "POST"])
def country_data_renderer():
    global macro_data
    country = request.args.get("country").strip()
    data_country = macro_data[country]
    years = sorted(data_country.keys(), reverse=True)  # Get years in descending order

    formatted_data = {
        "gdp": {
            "labels": years,
            "values": [data_country[year]["gdp"] for year in years],
            "unit": "Million USD",
        },
        "per_capita_gdp": {
            "labels": years,
            "values": [data_country[year]["gdp_per_capita"] for year in years],
            "unit": "USD",
        },
        "inflation": {
            "labels": years,
            "values": [data_country[year]["inflation"] for year in years],
            "unit": "Percent",
        },
        "unemployment": {
            "labels": years,
            "values": [data_country[year]["unemployment"] for year in years],
            "unit": "Percent",
        },
    }

    return formatted_data, 200


@app.route("/lesson-progress-update", methods=["POST", "GET"])
def lesson_progress():
    userid = request.cookies.get("userid")
    chapter_number = request.args.get("chapter")

    with sqlite3.connect("main.db") as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT chapter{chapter_number}, percentage_complete, contributions FROM main WHERE userid = ?",
            (userid,),
        )
        row = cursor.fetchone()

        current_chapter_value = row[0]
        current_percentage = row[1]
        contributions_json = row[2]

        new_chapter_value = current_chapter_value + 1

        new_percentage = current_percentage + 1

        contributions = json.loads(contributions_json)
        today = datetime.datetime.now().strftime("%Y-%m-%d")

        if today in contributions:
            contributions[today] = contributions[today] + 1
        else:
            contributions[today] = 1

        cursor.execute(
            f"UPDATE main SET chapter{chapter_number} = ?, percentage_complete = ?, contributions = ? WHERE userid = ?",
            (new_chapter_value, new_percentage, json.dumps(contributions), userid),
        )

        conn.commit()
        return "Progress updated", 200


@app.route("/display-contributions", methods=["GET"])
def display_contributions():
    userid = request.cookies.get("userid")

    with sqlite3.connect("main.db") as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT contributions FROM main WHERE userid = ?", (userid,))
        row = cursor.fetchone()

        contributions = row[0]

    return contributions


@app.route("/get-lesson-progress", methods=["GET"])
def get_lesson_progress():
    userid = request.cookies.get("userid")

    with sqlite3.connect("main.db") as conn:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, percentage_complete FROM main WHERE userid = ?",
            (userid,),
        )
        row = cursor.fetchone()

        progress = {
            "chapter1": row[0],
            "chapter2": row[1],
            "chapter3": row[2],
            "chapter4": row[3],
            "chapter5": row[4],
            "chapter6": row[5],
            "chapter7": row[6],
            "chapter8": row[7],
            "percentage_complete": row[8],
        }

    return progress


@app.route("/learn-user-create", methods=["POST", "GET"])
def create_user_learn():
    conn = sqlite3.connect("main.db")
    cursor = conn.cursor()

    userid = request.cookies.get("userid")
    if userid:
        cursor.execute("SELECT userid FROM main WHERE userid = ?", (userid,))
        if cursor.fetchone():
            return "User already exists", 200

    new_userid = str(uuid.uuid4())
    cursor.execute(
        """
        INSERT INTO main (userid, chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, contributions, percentage_complete)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, "{}", 0)
    """,
        (new_userid,),
    )
    conn.commit()

    response = make_response("User created")
    response.set_cookie("userid", new_userid)
    return response, 200


@app.route("/macroeconomic", methods=["GET"])
def worldmap_page():
    return render_template("macroeconomic.html")


@app.route("/news", methods=["GET"])
def news():
    return render_template("news.html")


@app.route("/learn", methods=["GET"])
def learn():
    return render_template("stonks_learn.html")


@app.route("/invest", methods=["GET"])
def invest():
    return render_template("stonks_invest.html")


@app.route("/movers", methods=["GET"])
def movers():
    return render_template("movers.html")


@app.route("/learn/lesson1", methods=["GET"])
def lesson1():
    return render_template("lesson1.html")


@app.route("/", methods=["GET"])
def home():
    return render_template("stonks.html")


@app.route("/module1lesson1", methods=["GET"])
def module1lesson1():
    return render_template("module1lesson1.html")


@app.route("/module1lesson2", methods=["GET"])
def module1lesson2():
    return render_template("module1lesson2.html")


@app.route("/module1lesson3", methods=["GET"])
def module1lesson3():
    return render_template("module1lesson3.html")


@app.route("/module2lesson1", methods=["GET"])
def module2lesson1():
    return render_template("module2lesson1.html")


@app.route("/module2lesson2", methods=["GET"])
def module2lesson2():
    return render_template("module2lesson2.html")


@app.route("/module2lesson3", methods=["GET"])
def module2lesson3():
    return render_template("module2lesson3.html")


@app.route("/analyze", methods=["GET"])
def analyze():
    return render_template("analysis.html")


@app.route("/analysis_data", methods=["GET"])
def analysis_data():
    ticker = request.args.get("ticker")
    exchange = request.args.get("exchange")

    stock = yf.Ticker(ticker)

    # Get basic company info
    info = stock.info
    company_name = info.get("longName", "N/A")
    ceo_name = (
        info.get("companyOfficers", [{}])[0].get("name", "N/A")
        if info.get("companyOfficers")
        else "N/A"
    )
    market_cap = info.get("marketCap", "N/A")
    founded_date = info.get("foundedYear", "N/A")

    # Get financial data
    financials = stock.financials
    balance_sheet = stock.balance_sheet
    cashflow = stock.cashflow

    # Get annual ratios for last 4 years
    annual_ratios = {}
    if not financials.empty and not balance_sheet.empty:
        years = financials.columns[:4]  # Last 4 years

        for year in years:
            year_str = str(year.year)
            annual_ratios[year_str] = {}

            # Calculate P/E (Price to Earnings)
            if "Net Income" in financials.index and year in financials.columns:
                net_income = financials.loc["Net Income", year]
                shares_outstanding = info.get("sharesOutstanding", 1)
                eps = net_income / shares_outstanding if shares_outstanding else 0
                pe_ratio = info.get("currentPrice", 0) / eps if eps != 0 else "N/A"
                annual_ratios[year_str]["PE"] = pe_ratio
            else:
                annual_ratios[year_str]["PE"] = "N/A"

                # Calculate P/S (Price to Sales)
            if "Total Revenue" in financials.index and year in financials.columns:
                revenue = financials.loc["Total Revenue", year]
                shares_outstanding = info.get("sharesOutstanding", 1)
                revenue_per_share = (
                    revenue / shares_outstanding if shares_outstanding else 0
                )
                ps_ratio = (
                    info.get("currentPrice", 0) / revenue_per_share
                    if revenue_per_share != 0
                    else "N/A"
                )
                annual_ratios[year_str]["PS"] = ps_ratio
            else:
                annual_ratios[year_str]["PS"] = "N/A"

                # EV/EBITDA calculation (simplified)
            annual_ratios[year_str]["EV_EBITDA"] = info.get("enterpriseToEbitda", "N/A")

        # Get current financial metrics
        current_metrics = {
            "Total_Cash": (
                balance_sheet.loc["Cash And Cash Equivalents", balance_sheet.columns[0]]
                if "Cash And Cash Equivalents" in balance_sheet.index
                and not balance_sheet.empty
                else "N/A"
            ),
            "Total_Cash_Per_Share": info.get("totalCashPerShare", "N/A"),
            "Revenue": (
                financials.loc["Total Revenue", financials.columns[0]]
                if "Total Revenue" in financials.index and not financials.empty
                else "N/A"
            ),
            "Gross_Profit": (
                financials.loc["Gross Profit", financials.columns[0]]
                if "Gross Profit" in financials.index and not financials.empty
                else "N/A"
            ),
            "Total_Debt": (
                balance_sheet.loc["Total Debt", balance_sheet.columns[0]]
                if "Total Debt" in balance_sheet.index and not balance_sheet.empty
                else "N/A"
            ),
            "Total_Debt_to_Equity": info.get("debtToEquity", "N/A"),
            "Operating_Cash_Flow": (
                cashflow.loc["Operating Cash Flow", cashflow.columns[0]]
                if "Operating Cash Flow" in cashflow.index and not cashflow.empty
                else "N/A"
            ),
        }

        # Compile all data
        analysis_result = {
            "company_info": {
                "name": company_name,
                "ceo": ceo_name,
                "market_cap": market_cap,
                "founded": founded_date,
            },
            "annual_ratios": annual_ratios,
            "current_metrics": current_metrics,
        }

        return analysis_result

    return {"error": "Invalid exchange"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1000, debug=True)
