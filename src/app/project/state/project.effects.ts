import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ProjectRestService} from "../rest/project-rest.service";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {
    acceptOffer,
    acceptOfferError,
    acceptOfferSuccess,
    completeContract,
    completeContractError,
    completeContractSuccess,
    createProject,
    createProjectError,
    createProjectSuccess,
    loadProject,
    loadProjectError,
    loadProjects,
    loadProjectsError,
    loadProjectsSuccess,
    loadProjectSuccess,
    makeNewOffer,
    makeNewOfferError,
    makeNewOfferSuccess,
    rejectOffer,
    rejectOfferError,
    rejectOfferSuccess,
    resumeContract,
    resumeContractError,
    resumeContractSuccess,
    signContract,
    signContractError,
    signContractSuccess,
    terminateContract,
    terminateContractError,
    terminateContractSuccess
} from "./project.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ContractRestService} from "../rest/contract-rest.service";

@Injectable()
export class ProjectEffects {
    constructor(private actions$: Actions, private projectRestService: ProjectRestService,
                private messageService: MessageService, private contractRestService: ContractRestService) {
    }

    loadProjects$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadProjects),
            mergeMap(() => this.projectRestService.getProjects()
                .pipe(
                    map(projects => loadProjectsSuccess({projects: projects})),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: "Error loading projects.",
                            detail: `There was a problem with loading projects.`
                        });
                        return of(loadProjectsError({error: error}))
                    })
                ))
        )
    });

    loadProject$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadProject),
            mergeMap(action => this.projectRestService.getProject(action.projectId)
                .pipe(
                    map(project => {
                        return loadProjectSuccess({project: project})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error loading project.`,
                            detail: `There was a problem with loading project with id ${action.projectId}.`
                        });
                        return of(loadProjectError({error: error}))
                    })
                ))
        )
    })

    createProject$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(createProject),
            mergeMap(action => this.projectRestService.createProject(action.projectCreate)
                .pipe(
                    map(project => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Project created.`,
                            detail: `Project with id: ${project.id} was created.`
                        });
                        return createProjectSuccess({project: project})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error creating project`,
                            detail: `There was a problem with creating new project.`
                        });
                        return of(createProjectError({error: error}))
                    })
                ))
        )
    });

    acceptOffer$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(acceptOffer),
            mergeMap(action => this.contractRestService.acceptOffer(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract offer accepted.`,
                            detail: `Contract with id: ${contract.id} was accepted.`
                        });
                        return acceptOfferSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error accepting contract offer.`,
                            detail: `There was a problem with accepting an offer.`
                        });
                        return of(acceptOfferError({error: error}))
                    })
                ))
        )
    });

    completeContract$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(completeContract),
            mergeMap(action => this.contractRestService.complete(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract completed.`,
                            detail: `Contract with id: ${contract.id} was completed.`
                        });
                        return completeContractSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error completing contract.`,
                            detail: `There was a problem with completing a contract.`
                        });
                        return of(completeContractError({error: error}))
                    })
                ))
        )
    });

    makeNewOffer$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(makeNewOffer),
            mergeMap(action => this.contractRestService.makeNewOffer(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `New offer made.`,
                            detail: `New offer for contract with id: ${contract.id} was make.`
                        });
                        return makeNewOfferSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error making new offer.`,
                            detail: `There was a problem with making new offer.`
                        });
                        return of(makeNewOfferError({error: error}))
                    })
                ))
        )
    });

    rejectContract$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(rejectOffer),
            mergeMap(action => this.contractRestService.rejectOffer(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract offer rejected.`,
                            detail: `Contract with id: ${contract.id} was rejected.`
                        });
                        return rejectOfferSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error rejecting contract offer.`,
                            detail: `There was a problem with rejecting an offer.`
                        });
                        return of(rejectOfferError({error: error}))
                    })
                ))
        )
    });

    resumeContract$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(resumeContract),
            mergeMap(action => this.contractRestService.resume(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract resumed.`,
                            detail: `Contract with id: ${contract.id} was resumed.`
                        });
                        return resumeContractSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error rejecting contract offer.`,
                            detail: `There was a problem with rejecting an offer.`
                        });
                        return of(resumeContractError({error: error}))
                    })
                ))
        )
    });

    signContract$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(signContract),
            mergeMap(action => this.contractRestService.sign(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract signed.`,
                            detail: `Contract with id: ${contract.id} was signed.`
                        });
                        return signContractSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error signing contract.`,
                            detail: `There was a problem with signing a contract.`
                        });
                        return of(signContractError({error: error}))
                    })
                ))
        )
    });

    terminateContract$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(terminateContract),
            mergeMap(action => this.contractRestService.terminate(action.contractId, action.contract)
                .pipe(
                    map(contract => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Contract terminated.`,
                            detail: `Contract with id: ${contract.id} was terminated.`
                        });
                        return terminateContractSuccess({contract: contract})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error terminating contract.`,
                            detail: `There was a problem with terminating a contract.`
                        });
                        return of(terminateContractError({error: error}))
                    })
                ))
        )
    });
}
