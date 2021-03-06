import {
  Get,
  Controller,
  Post,
  Body,
  Res,
  Param,
  Put,
  Delete,
  Query,
  Patch,
} from "@nestjs/common";
import { ReservesService } from "./reserves.service";
import { ReservesModel } from "./models/reserves.model";
import { ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { Reserves } from "./dto/reserves";

@Controller()
export class ReservesController {
  constructor(private readonly service: ReservesService) { }

  @ApiBody({ description: "Criação da reserva", type: Reserves })
  @Post()
  async create(@Body() body, @Res() res) {

    body.timeOpen = Helper.parseDate(body.timeOpen);
    body.timeClose = Helper.parseDate(body.timeClose);

    const model: ReservesModel = body;

    try {
      if (!model) {
        return res.status(400).json({ message: "Reserva inválida!" });
      }

      const reserves = await this.service.create(model);
      let newreserves = JSON.parse(JSON.stringify(reserves));
      newreserves.timeOpen = Helper.formatDate(reserves.timeOpen);
      newreserves.timeClose = Helper.formatDate(reserves.timeClose);

      return res.status(201).json(newreserves);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao criar as reservas", error });
    }
  }

  @Get()
  async findAll(@Res() res): Promise<ReservesModel[]> {
    try {
      const reserves = await this.service.findAll();
      let newreserves = JSON.parse(JSON.stringify(reserves));

      newreserves.map((reserve, index) => {
        reserve.timeOpen = Helper.formatDate(reserves[index].timeOpen);
        reserve.timeClose = Helper.formatDate(reserves[index].timeClose);
      });

      return res.status(200).json(newreserves);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao buscar as reservas", error });
    }
  }

  /**
   * @param id \string user id
   * @query timeOpen \Date? data de abertura da reserva
   * @query timeClose \Date? data de fechamento da reserva
   */

  @ApiParam({ name: "id", type: "" })
  @ApiQuery({
    name: "timeOpen",
    type: "",
    required: false,
    description: "yyyy-mm-dd",
  })
  @ApiQuery({
    name: "timeClose",
    type: "",
    required: false,
    description: "yyyy-mm-dd",
  })
  @Get("user/:id")
  async findByUserID(
    @Param() params,
    @Query() query,
    @Res() res
  ): Promise<ReservesModel[]> {

    try {
      let timeOpen = "timeOpen" in query ? new Date(query.timeOpen) : null;
      let timeClose = "timeClose" in query ? new Date(query.timeClose) : null;

      if ("timeOpen" in query && !Helper.isValidDate(timeOpen))
        throw "Data de início inválida";

      if ("timeClose" in query && !Helper.isValidDate(timeClose))
        throw "Data de término inválida";

      if (Helper.isValidDate(timeOpen) && Helper.isValidDate(timeClose)) {
        const reserves = await this.service.findByUserBetweenDates(
          params.id,
          query.timeOpen,
          query.timeClose
        );

        let newreserves = JSON.parse(JSON.stringify(reserves));
        newreserves.map((reserve, index) => {
          reserve.timeOpen = Helper.formatDate(reserves[index].timeOpen);
          reserve.timeClose = Helper.formatDate(reserves[index].timeClose);
        });
        return res.status(200).json(newreserves);
      }

      const reserves = await this.service.findByUserId(
        params.id,
        query.timeOpen
      );
      let newreserves = JSON.parse(JSON.stringify(reserves));
      newreserves.map((reserve, index) => {
        reserve.timeOpen = Helper.formatDate(reserves[index].timeOpen);
      });
      return res.status(200).json(newreserves);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao buscar as reservas", error });
    }
  }

  /**
   * @query type \string (timeOpen or timeClose)
   * @query min \Date data de limite inferior da busca
   * @query max \Date data de limite superior da busca
   */

  @ApiQuery({
    name: "type",
    type: "",
    required: true,
    description: "timeOpen or timeClose",
  })
  @ApiQuery({
    name: "min",
    type: "",
    required: true,
    description: "yyyy-mm-dd",
  })
  @ApiQuery({
    name: "max",
    type: "",
    required: true,
    description: "yyyy-mm-dd",
  })
  @Get("/period")
  async findByPeriod(@Query() query, @Res() res): Promise<ReservesModel[]> {
    try {
      let type = "type" in query ? query.type : null;
      let min = "min" in query ? new Date(query.min) : null;
      let max = "max" in query ? new Date(query.max) : null;

      if (!type || (type != "timeOpen" && type != "timeClose"))
        throw "Type é obrigatório e deve ser ou timeOpen ou timeClose";

      if (!min || !Helper.isValidDate(min)) throw "Data mínima inválida";

      if (!max || !Helper.isValidDate(max)) throw "Data máxima inválida";

      const reserves = await this.service.findByPeriod(
        type,
        query.min,
        query.max
      );
      let newreserves = JSON.parse(JSON.stringify(reserves));
      newreserves.map((reserve, index) => {
        reserve.timeOpen = Helper.formatDate(reserves[index].timeOpen);
        reserve.timeClose = Helper.formatDate(reserves[index].timeClose);
      });
      return res.status(200).json(newreserves);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao buscar as reservas", error });
    }
  }

  @ApiParam({ name: "id", type: "" })
  @Get(":id")
  async findByID(@Param() params, @Res() res): Promise<ReservesModel[]> {
    try {
      const reserves = await this.service.findById(params.id);
      let newreserves = JSON.parse(JSON.stringify(reserves));
      newreserves.timeOpen = Helper.formatDate(reserves.timeOpen);
      newreserves.timeClose = Helper.formatDate(reserves.timeClose);
      return res.status(200).json(newreserves);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao buscar as reservas", error });
    }
  }

  @ApiParam({ name: "id", type: "" })
  @Put(":id")
  @ApiBody({ description: "Criação da reserva", type: Reserves })
  async update(
    @Param("id") id: string,
    @Res() res,
    @Body() body
  ): Promise<ReservesModel> {
    try {

      body.timeOpen = Helper.parseDate(body.timeOpen);
      body.timeClose = Helper.parseDate(body.timeClose);

      let timeOpen = "timeOpen" in body ? new Date(body.timeOpen) : null;
      let timeClose = "timeClose" in body ? new Date(body.timeClose) : null;

      if ("timeOpen" in body && !Helper.isValidDate(timeOpen))
        throw "Data de início inválida";

      if ("timeClose" in body && !Helper.isValidDate(timeClose))
        throw "Data de término inválida";

      const model: ReservesModel = body;
      const reservas = await this.service.update(id, model);

      let newreserves = JSON.parse(JSON.stringify(reservas));
      newreserves.timeOpen = Helper.formatDate(reservas.timeOpen);
      newreserves.timeClose = Helper.formatDate(reservas.timeClose);

      return res.status(200).json(newreserves);
    } catch (error) {
      return res.status(400).json({
        message: "Ops! Ocorreu um erro ao alterar as reservas",
        error,
      });
    }
  }

  @ApiParam({ name: "id", type: "" })
  @Patch(":id")
  @ApiBody({ description: "Alteração da reserva", type: Reserves })
  async patch(
    @Param("id") id: string,
    @Res() res,
    @Body() body
  ): Promise<ReservesModel> {
    try {

      body.timeOpen = Helper.parseDate(body.timeOpen);
      body.timeClose = Helper.parseDate(body.timeClose);

      let timeOpen = "timeOpen" in body ? new Date(body.timeOpen) : null;
      let timeClose = "timeClose" in body ? new Date(body.timeClose) : null;

      if ("timeOpen" in body && !Helper.isValidDate(timeOpen))
        throw "Data de início inválida";

      if ("timeClose" in body && !Helper.isValidDate(timeClose))
        throw "Data de término inválida";

      const model: ReservesModel = body;

      const reservas = await this.service.update(id, model);

      let newreserves = JSON.parse(JSON.stringify(reservas));
      newreserves.timeOpen = Helper.formatDate(reservas.timeOpen);
      newreserves.timeClose = Helper.formatDate(reservas.timeClose);

      return res.status(200).json(newreserves);
    } catch (error) {
      return res.status(400).json({
        message: "Ops! Ocorreu um erro ao alterar as reservas",
        error,
      });
    }
  }

  @ApiParam({ name: "id", type: "" })
  @Delete(":id")
  async delete(@Param("id") id: string, @Res() res): Promise<ReservesModel> {
    try {
      const reserves = await this.service.delete(id);
      return res.status(200).json({ message: "Removido com sucesso!" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Ops! Ocorreu um erro ao buscar as reservas", error });
    }
  }
}

class Helper {

  static parseDate = function (input) {
    var parts = input.match(/(\d+)/g);
    const newdate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);
    if (this.isValidDate(newdate)) {
      return newdate;
    }
    return input;
  };

  static formatDate = function (date: Date) {
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    };
    return new Intl.DateTimeFormat('pt-br', options).format(date);
  }

  static isValidDate = function isValidDate(d: Date) {
    return d instanceof Date && !isNaN(+d);
  };

}
